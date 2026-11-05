import { pickQuickFeelings } from '../quick-feelings';

const s = (emotionId: any, endedAt: number) => ({ emotionId, endedAt });

describe('pickQuickFeelings', () => {
  it('offers Joy and Sadness before any check-ins', () => {
    expect(pickQuickFeelings([])).toEqual(['joy', 'sadness']);
  });

  it('puts the most-picked feelings first and breaks ties by the latest', () => {
    const sessions = [s('anger', 1), s('fear', 5), s('anger', 2), s('trust', 9), s('fear', 3)];
    expect(pickQuickFeelings(sessions)).toEqual(['fear', 'anger']);
  });

  it('tops up with the defaults and leaves out "Not sure"', () => {
    expect(pickQuickFeelings([s('confused', 1), s('confused', 2), s('sadness', 3)])).toEqual(['sadness', 'joy']);
  });
});
