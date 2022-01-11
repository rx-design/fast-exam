import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, writeBatch } from 'firebase/firestore';
import { toObject} from '@/composables/utils';
import { Quiz, Room } from '~/types';
import { Entity, SheetQuiz } from '@/types';

function createQuizzes(sheets: SheetQuiz[]): Promise<void> {
  const db = getFirestore();
  const batch = writeBatch(db);

  sheets.forEach(sheet => {
    const quiz: Quiz = {
      name: sheet.name,
      isActive: false,
      questionIds: [],
    };

    sheet.questions.forEach(record => {
      const ref = doc(collection(db, 'questions'));

      quiz.questionIds.push(ref.id);

      batch.set(ref, record);
    });

    const ref = doc(collection(db, 'quizzes'));
    batch.set(ref, quiz);
  });

  return batch.commit();
}

function getQuizzes(): Promise<Entity<Quiz>[]> {
  const db = getFirestore();

  return getDocs(collection(db, 'quizzes'))
    .then(snapshot => snapshot.docs.map(doc => toObject<Quiz>(doc)));
}

function getQuizName(roomId: string): Promise<string> {
  const db = getFirestore();

  return getDoc(doc(db, 'rooms', roomId))
    .then(snapshot => {
      const room = toObject<Room>(snapshot);

      return getDoc(doc(db, 'quizzes', room.quizId));
    })
    .then(snapshot => {
      const quiz = toObject<Quiz>(snapshot);

      return Promise.resolve(quiz.name);
    });
}

function setActiveQuiz(quiz: Entity<Quiz>): Promise<void> {
  const db = getFirestore();

  return getDocs(collection(db, 'quizzes'))
    .then(snapshot => {
      const batch = writeBatch(db);

      snapshot.forEach(doc => {
        const isActive = doc.ref.id === quiz.ref.id;
        batch.update(doc.ref, { isActive });
      });

      return batch.commit();
    });
}

function removeQuiz(quiz: Entity<Quiz>): Promise<void> {
  const db = getFirestore();
  const batch = writeBatch(db);

  quiz.questionIds.forEach(questionId => {
    const docRef = doc(db, 'questions', questionId);
    batch.delete(docRef);
  });

  batch.commit();

  return deleteDoc(quiz.ref);
}

export {
  createQuizzes,
  getQuizzes,
  getQuizName,
  setActiveQuiz,
  removeQuiz,
};
