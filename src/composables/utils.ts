import { DocumentSnapshot } from '@firebase/firestore';
import { Entity } from '@/types';

/**
 * Converts a snapshot to object
 * @param {DocumentSnapshot} snapshot
 * @return {object}
 */
function toObject<T>(snapshot: DocumentSnapshot): Entity<T> {
  return <Entity<T>>{
    ref: snapshot.ref,
    ...snapshot.data(),
  };
}

/**
 * Returns a document identifier
 * @param {Entity<T>} doc
 * @return {object}
 */
function getId<T>(doc: Entity<T>): string {
  return doc.ref.id;
}

export {
  toObject,
  getId,
};
