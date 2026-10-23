import { FEEDBACK_MAX_LENGTH, useFeedbackStore, validateFeedback } from '../store';

describe('feedback', () => {
  it('rejects empty and overly long text', () => {
    expect(validateFeedback('   ')).not.toBeNull();
    expect(validateFeedback('a'.repeat(FEEDBACK_MAX_LENGTH + 1))).not.toBeNull();
    expect(validateFeedback('That helped, thank you')).toBeNull();
  });

  it('stores trimmed feedback, newest first', () => {
    const { add } = useFeedbackStore.getState();
    add({ message: ' first ', sessionId: 's1', emotionId: 'joy' });
    add({ message: 'second', sessionId: 's2', emotionId: 'anger' });

    const messages = useFeedbackStore.getState().entries.map((e) => e.message);
    expect(messages).toEqual(['second', 'first']);
  });
});
