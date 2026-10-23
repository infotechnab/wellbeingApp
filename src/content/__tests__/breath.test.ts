import { breathStateAt } from '../breath';

describe('breathStateAt', () => {
  const pattern = { inhaleSec: 4, holdSec: 2, exhaleSec: 6, rounds: 3 };

  it('walks through inhale, hold and exhale', () => {
    expect(breathStateAt(pattern, 0)).toMatchObject({ phase: 'in', round: 1, phaseProgress: 0 });
    expect(breathStateAt(pattern, 2)).toMatchObject({ phase: 'in', round: 1, phaseProgress: 0.5 });
    expect(breathStateAt(pattern, 5)).toMatchObject({ phase: 'hold', round: 1, phaseProgress: 0.5 });
    expect(breathStateAt(pattern, 9)).toMatchObject({ phase: 'out', round: 1, phaseProgress: 0.5 });
  });

  it('counts rounds and stays on the last breath at the end', () => {
    expect(breathStateAt(pattern, 12)).toMatchObject({ phase: 'in', round: 2 });
    expect(breathStateAt(pattern, 999)).toMatchObject({ phase: 'out', round: 3 });
  });

  it('works without a hold', () => {
    expect(breathStateAt({ inhaleSec: 5, exhaleSec: 5, rounds: 5 }, 5)).toMatchObject({ phase: 'out', round: 1 });
  });
});
