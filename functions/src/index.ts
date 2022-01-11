import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
  Player,
  Room,
  Quiz,
  Question,
  PlayerQuestion,
  Answer,
  Result,
} from './types';

type Transaction = FirebaseFirestore.Transaction;
type Snapshot = FirebaseFirestore.DocumentSnapshot;
type Reference = FirebaseFirestore.DocumentReference;

type Entity<T> = T & {
  ref: Reference;
};

admin.initializeApp(functions.config().firebase);
const database = admin.firestore();

const SCORE_TO_WIN = 5;
const MULTIPLAYER_ROOM_SIZE = 2;

/**
 * Converts a snapshot to object
 * @param {DocumentSnapshot} snapshot
 * @return {object}
 */
function toObject<T>(snapshot: Snapshot): Entity<T> {
  return <Entity<T>>{
    ref: snapshot.ref,
    ...snapshot.data(),
  };
}

/**
 * Returns a random index
 * @param {number} size
 * @return {number}
 */
function getRandomIndex(size: number) {
  return Math.floor(Math.random() * Math.floor(size));
}

/**
 * Creates a game result
 * @param {Transaction} transaction
 * @param {Result} result
 * @return {string}
 */
function createResult(
  transaction: Transaction,
  result: Result,
) {
  const docRef = database.collection('records').doc();

  transaction.set(docRef, result);

  return docRef.id;
}

/**
 * Creates a player question
 * @param {Transaction} transaction
 * @param {Entity<Room>} room
 * @param {Entity<Player>} player
 * @param {Entity<Question>} question
 * @return {string}
 */
function createPlayerQuestion(
  transaction: Transaction,
  room: Entity<Room>,
  player: Entity<Player>,
  question: Entity<Question>,
) {
  const playerQuestion = {
    text: question.text,
    imageUrl: question.imageUrl,
    options: question.options,
    correctOption: question.correctOption,
    answerId: '',
    playerId: player.ref.id,
    roomId: room.ref.id,
  };

  const docRef = database.collection('playerQuestions').doc();

  transaction.set(docRef, playerQuestion);

  return docRef.id;
}

/**
 * Creates a room
 * @param {Transaction} transaction
 * @param {Room} room
 * @return {string}
 */
function createRoom(
  transaction: Transaction,
  room: Room,
) {
  const docRef = database.collection('rooms').doc();

  transaction.set(docRef, room);

  return docRef.id;
}

/**
 * Returns a random question
 * @param {Transaction} transaction
 * @param {Entity<Room>} room
 * @return {Promise<string>}
 */
function getRandomQuestion(
  transaction: Transaction,
  room: Entity<Room>,
) {
  return database.collection('quizzes').doc(room.quizId).get()
    .then(doc => {
      const quiz = toObject<Quiz>(doc);

      const questionId = quiz.questionIds[
        getRandomIndex(quiz.questionIds.length)
      ];

      const docRef = database.collection('questions').doc(questionId);

      return transaction.get(docRef);
    })
    .then(doc => toObject<Question>(doc));
}

/**
 * Generates game results
 * @param {Transaction} transaction
 * @param {Entity<Room>} room
 * @return {Promise<void[]>}
 */
async function generateResults(
  transaction: Transaction,
  room: Entity<Room>,
) {
  const doc = await database.collection('quizzes').doc(room.quizId).get();
  const quiz = toObject<Quiz>(doc);

  const maxScore = Math.max(...Object.values(room.scores));

  const reads = room.playerIds.map(async playerId => {
    const doc = await database.collection('players').doc(playerId).get();
    const player = toObject<Player>(doc);

    const snapshot = await transaction
      .get(database
        .collection('playerQuestions')
        .where('playerId', '==', playerId));

    const user = await admin.auth().getUser(player.userId);
    const score = room.scores[playerId];
    const questionsCount = snapshot.size;

    const result: Result = {
      userId: user.uid,
      userDisplayName: user.displayName ?? '',
      gameId: room.ref.id,
      quizId: quiz.ref.id,
      quizName: quiz.name,
      rightAnswers: score,
      wrongAnswers: questionsCount - score,
      won: maxScore === score,
    };

    return result;
  });

  const readResults = await Promise.all(reads);

  const writes = readResults.map(result => {
    createResult(transaction, result);
  });

  return Promise.all(writes);
}

/**
 * Answers the question and finishes a game if win condition is met
 * @param {Transaction} transaction
 * @param {Entity<Answer>} answer
 * @return {Promise<void>}
 */
function answerQuestion(
  transaction: Transaction,
  answer: Entity<Answer>,
) {
  const docRef = database.collection('playerQuestions').doc(answer.questionId);

  return transaction.get(docRef)
    .then(doc => {
      const question = toObject<PlayerQuestion>(doc);

      return Promise.all([
        Promise.resolve(question),
        transaction.get(
          database
            .collection('players')
            .doc(question.playerId),
        ),
        transaction.get(
          database
            .collection('rooms')
            .doc(question.roomId),
        ),
      ]);
    })
    .then(async (data) => {
      const question = data[0];
      const player = toObject<Player>(data[1]);
      const room = toObject<Room>(data[2]);

      if (room.closed || question.answerId !== '') {
        return;
      }

      if (question.correctOption !== answer.selectedOption) {
        await getRandomQuestion(transaction, room)
          .then(question => createPlayerQuestion(transaction, room, player, question));
      } else {
        const playerId = player.ref.id;
        room.scores[playerId] += 1;

        if (room.scores[playerId] === SCORE_TO_WIN) {
          room.closed = true;
        } else {
          await getRandomQuestion(transaction, room)
            .then(question => createPlayerQuestion(transaction, room, player, question));
        }

        transaction.update(room.ref, {
          scores: room.scores,
          closed: room.closed,
        });
      }

      transaction.update(question.ref, {
        answerId: answer.ref.id,
      });
    });
}

/**
 * Starts a game and creates a question for every player in the room
 * @param {Transaction} transaction
 * @param {Entity<Room>} room
 * @return {Promise<string[]>}
 */
async function startGame(
  transaction: Transaction,
  room: Entity<Room>,
) {
  const players = await Promise.all(
    room.playerIds.map(playerId => {
      const docRef = database.collection('players').doc(playerId);

      return transaction
        .get(docRef)
        .then(doc => toObject<Player>(doc));
    }),
  );

  const questions = await Promise.all(
    players.map(player => {
      return getRandomQuestion(transaction, room)
        .then(question => ({ player, question }));
    }),
  );

  questions.forEach(obj => {
    createPlayerQuestion(transaction, room, obj.player, obj.question);
  });
}

/**
 * Finds unfilled open room
 *
 * @param {Transaction} t
 * @return {Promise<Entity<Room> | null>}
 */
async function findRoom(t: Transaction) {
  const query = database.collection('rooms')
    .where('closed', '==', false)
    .where('full', '==', false)
    .limit(1);

  const snapshot = await t.get(query);

  if (snapshot.empty) {
    return null;
  }

  return toObject<Room>(snapshot.docs[0]);
}

/**
 * Finds active quiz
 *
 * @param {Transaction} t
 * @return {Promise<Entity<Quiz> | null>}
 */
async function findQuiz(t: Transaction) {
  const query = database.collection('quizzes')
    .where('isActive', '==', true)
    .limit(1);

  const snapshot = await t.get(query);

  if (snapshot.empty) {
    return null;
  }

  return toObject<Quiz>(snapshot.docs[0]);
}

/**
 * Adds player to unfilled existing or a new room
 *
 * @param {Transaction} t
 * @param {Entity<Player>} player
 *
 * @return {Promise<void>}
 */
async function addPlayer(t: Transaction, player: Entity<Player>) {
  const room = await findRoom(t);

  if (room) {
    room.playerIds.push(player.ref.id);
    room.scores[player.ref.id] = 0;

    if (room.playerIds.length === room.size) {
      room.full = true;
    }

    t.update(room.ref, {
      playerIds: room.playerIds,
      scores: room.scores,
      full: room.full,
    });
  } else {
    const quiz = await findQuiz(t);

    if (quiz) {
      createRoom(t, {
        full: player.single,
        size: player.single
          ? 1
          : MULTIPLAYER_ROOM_SIZE,
        quizId: quiz.ref.id,
        playerIds: [player.ref.id],
        scores: {
          [player.ref.id]: 0,
        },
        closed: false,
      });
    }
  }
}

exports.playerCreated = functions.firestore
  .document('players/{playerId}')
  .onCreate(async (doc) => {
    const player = toObject<Player>(doc);

    await database.runTransaction(async (t) => {
      await addPlayer(t, player);
    });
  });

exports.roomCreated = functions.firestore
  .document('rooms/{roomId}')
  .onCreate(doc => {
    const room = toObject<Room>(doc);

    if (room.full) {
      return database.runTransaction(transaction => {
        return startGame(transaction, room);
      });
    } else {
      return Promise.resolve();
    }
  });

exports.roomUpdated = functions.firestore
  .document('rooms/{roomId}')
  .onUpdate(change => {
    const before = toObject<Room>(change.before);
    const after = toObject<Room>(change.after);

    if (!before.full && after.full) {
      return database.runTransaction(transaction => {
        return startGame(transaction, after);
      });
    } else if (!before.closed && after.closed) {
      return database.runTransaction(transaction => {
        return generateResults(transaction, after);
      });
    } else {
      return Promise.resolve();
    }
  });

exports.answerCreated = functions.firestore
  .document('answers/{answerId}')
  .onCreate(doc => {
    const answer = toObject<Answer>(doc);

    return database.runTransaction(transaction => {
      return answerQuestion(transaction, answer);
    });
  });
