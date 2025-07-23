
export enum GameState {
  Ready,
  Loading,
  Playing,
  Finished,
}

export interface Note {
  time: number; // in milliseconds
  lane: number; // 0 to 3
  id: string;
  judged: boolean;
}

export type Beatmap = Note[];

export enum Judgement {
  Perfect = 'Perfect',
  Great = 'Great',
  Good = 'Good',
  Miss = 'Miss',
}

export interface Score {
  points: number;
  combo: number;
  maxCombo: number;
  judgements: {
    [Judgement.Perfect]: number;
    [Judgement.Great]: number;
    [Judgement.Good]: number;
    [Judgement.Miss]: number;
  };
}
