import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  QuerySnapshot,
  Unsubscribe,
  where,
} from 'firebase/firestore';

function onPlayerQuestions(
  playerId: string,
  roomId: string,
  callback: (snapshot: QuerySnapshot) => void,
): Unsubscribe {
  const db = getFirestore();

  const q = query(
    collection(db, 'playerQuestions'),
    where('answerId', '==', ''),
    where('roomId', '==', roomId),
    where('playerId', '==', playerId),
  );

  return onSnapshot(q, callback);
}

export {
  onPlayerQuestions,
};
