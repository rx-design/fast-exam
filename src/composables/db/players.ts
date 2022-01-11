import { addDoc, collection, DocumentReference, getFirestore } from 'firebase/firestore';
import { Player } from '~/types';

function createPlayer(player: Player): Promise<DocumentReference> {
  return addDoc(collection(getFirestore(), 'players'), player);
}

export {
  createPlayer,
};
