type Player = {
  userId: string;
  single: boolean;
};

type Room = {
  size: number;
  full: boolean;
  quizId: string;
  playerIds: string[];
  scores: Record<string, number>;
  closed: boolean;
};

type Quiz = {
  name: string;
  isActive: boolean;
  questionIds: string[];
};

type Question = {
  text: string;
  imageUrl: string;
  options: string[];
  correctOption: number;
};

type PowerUp = {
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  isUsed: boolean;
};

type PlayerQuestion = Question & {
  answerId: string;
  playerId: string;
  roomId: string;
};

type Answer = {
  questionId: string;
  selectedOption: number;
};

type Result = {
  userId: string;
  userDisplayName: string;
  gameId: string;
  quizId: string;
  quizName: string;
  rightAnswers: number;
  wrongAnswers: number;
  won: boolean;
};

export {
  Player,
  Room,
  Quiz,
  Question,
  PowerUp,
  PlayerQuestion,
  Answer,
  Result,
};
