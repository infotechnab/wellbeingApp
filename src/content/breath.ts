import type { BreathPattern } from './types';

export type BreathPhase = 'in' | 'hold' | 'out';

export type BreathState = {
  phase: BreathPhase;
  /** 1-based round number. */
  round: number;
  /** 0 to 1 within the current phase. */
  phaseProgress: number;
  /** Seconds of the current phase. */
  phaseSec: number;
};

/** Where in the breathing pattern the user is after `elapsedSec`. */
export function breathStateAt(pattern: BreathPattern, elapsedSec: number): BreathState {
  const hold = pattern.holdSec ?? 0;
  const cycle = pattern.inhaleSec + hold + pattern.exhaleSec;
  const total = cycle * pattern.rounds;
  const t = Math.min(Math.max(elapsedSec, 0), total - 1e-6);
  const round = Math.floor(t / cycle) + 1;
  const inCycle = t - (round - 1) * cycle;

  if (inCycle < pattern.inhaleSec) {
    return { phase: 'in', round, phaseProgress: inCycle / pattern.inhaleSec, phaseSec: pattern.inhaleSec };
  }
  if (inCycle < pattern.inhaleSec + hold) {
    return { phase: 'hold', round, phaseProgress: (inCycle - pattern.inhaleSec) / hold, phaseSec: hold };
  }
  const outStart = pattern.inhaleSec + hold;
  return {
    phase: 'out',
    round,
    phaseProgress: (inCycle - outStart) / pattern.exhaleSec,
    phaseSec: pattern.exhaleSec,
  };
}
