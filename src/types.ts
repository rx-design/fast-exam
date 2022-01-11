import { DocumentReference } from '@firebase/firestore';
import { Question } from '~/types';

type Entity<T> = T & {
  ref: DocumentReference
};

type VueClass = {
  [key: string]: boolean;
}

type MenuLink = {
  tabName: string;
  to: string;
  label: string;
};

type SheetQuestion = {
  question: string;
  imageUrl: string;
  options: string;
  answer: 'A'|'B'|'C'|'D'|'E';
};

type SheetQuiz = {
  name: string;
  questions: Question[];
};

type StatisticsRecord = {
  user: string;
  numberOfGames: number;
  won: number;
  lost: number;
  rightAnswers: number;
  wrongAnswers: number;
};

export {
  Entity,
  VueClass,
  MenuLink,
  SheetQuestion,
  SheetQuiz,
  StatisticsRecord,
};
