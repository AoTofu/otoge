
import { Judgement } from './types';

export const LANE_COUNT = 4;
export const NOTE_SPEED = 0.4; // pixels per millisecond
export const GAME_DURATION_MS = 30000; // 30 seconds for generated beatmap
export const NOTE_LOOKAHEAD_MS = 2000; // How far ahead to check for notes

export const KEY_MAPPINGS: { [key: string]: number } = {
  d: 0,
  f: 1,
  j: 2,
  k: 3,
};

export const LANE_KEYS = ['D', 'F', 'J', 'K'];

// Timing windows in milliseconds
export const TIMING_WINDOWS = {
  [Judgement.Perfect]: 35,
  [Judgement.Great]: 70,
  [Judgement.Good]: 110,
  [Judgement.Miss]: 150,
};

export const JUDGEMENT_SCORES = {
  [Judgement.Perfect]: 100,
  [Judgement.Great]: 70,
  [Judgement.Good]: 30,
  [Judgement.Miss]: 0,
};

export const JUDGEMENT_COLORS: { [key in Judgement]: string } = {
    [Judgement.Perfect]: 'text-cyan-400',
    [Judgement.Great]: 'text-green-400',
    [Judgement.Good]: 'text-yellow-400',
    [Judgement.Miss]: 'text-red-500',
};
