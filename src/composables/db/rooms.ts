import {
  collection,
  doc,
  DocumentSnapshot,
  getFirestore,
  onSnapshot,
  query,
  QuerySnapshot,
  Unsubscribe,
  where,
} from 'firebase/firestore';

function onRooms(
  playerId: string,
  callback: (snapshot: QuerySnapshot) => void,
): Unsubscribe {
  const db = getFirestore();

  const q = query(
    collection(db, 'rooms'),
    where('closed', '==', false),
    where('playerIds', 'array-contains', playerId),
  );

  return onSnapshot(q, callback);
}

function onRoom(
  roomId: string,
  callback: (snapshot: DocumentSnapshot) => void,
): Unsubscribe {
  const db = getFirestore();

  return onSnapshot(doc(db,'rooms', roomId), callback);
}

export {
  onRooms,
  onRoom,
};
