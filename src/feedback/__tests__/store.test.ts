import { Platform } from 'react-native';

import { countWords, FEEDBACK_MAX_WORDS, feedbackLengthProblem, useFeedbackStore, validateFeedback } from '../store';

describe('feedback', () => {
  beforeEach(() => useFeedbackStore.setState({ entries: [] }));

  it('counts words, whatever the spacing', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords(' That  helped,\nthank you ')).toBe(4);
    expect(countWords('मलाई धेरै राम्रो लाग्यो')).toBe(4);
  });

  it('allows up to 200 words', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'calm').join(' ');
    expect(feedbackLengthProblem(words(FEEDBACK_MAX_WORDS))).toBeNull();
    expect(feedbackLengthProblem(words(FEEDBACK_MAX_WORDS + 1))).toBe('Please keep it to 200 words.');
    expect(feedbackLengthProblem('')).toBeNull();
  });

  it('rejects empty and overly long feedback after an exercise', () => {
    expect(validateFeedback('   ')).not.toBeNull();
    expect(validateFeedback('calm '.repeat(FEEDBACK_MAX_WORDS + 1))).not.toBeNull();
    expect(validateFeedback('That helped, thank you')).toBeNull();
  });

  it('stores trimmed feedback, newest first, with the version and platform that sent it', () => {
    const { add } = useFeedbackStore.getState();
    add({ message: ' first ', sessionId: 's1', emotionId: 'joy' });
    add({ message: 'second', sessionId: 's2', emotionId: 'anger' });

    const entries = useFeedbackStore.getState().entries;
    expect(entries.map((e) => e.message)).toEqual(['second', 'first']);
    expect(entries[0].platform).toBe(Platform.OS);
    expect(entries[0]).toHaveProperty('appVersion');
  });

  it('keeps a given id and voice message details', () => {
    const entry = useFeedbackStore.getState().add({
      id: 'f1',
      message: '',
      sessionId: null,
      emotionId: null,
      audioPath: 'user-1/f1.m4a',
      audioDurationMs: 83000,
    });
    expect(entry).toMatchObject({ id: 'f1', message: '', audioPath: 'user-1/f1.m4a', audioDurationMs: 83000 });
  });
});
