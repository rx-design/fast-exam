import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { Answer } from '~/types';

function createAnswer(answer: Answer): void {
  addDoc(collection(getFirestore(), 'answers'), answer);
}

export {
  createAnswer,
};
