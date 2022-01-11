import {
  collection,
  getDocs,
  getFirestore,
  query,
} from 'firebase/firestore';
import { toObject } from '@/composables/utils';
import { Result } from '~/types';
import { Entity } from '@/types';

function getRecords(): Promise<Entity<Result>[]> {
  const db = getFirestore();

  return getDocs(query(collection(db, 'records')))
    .then(snapshot => snapshot.docs.map(doc => toObject<Result>(doc)));
}

export {
  getRecords,
};
