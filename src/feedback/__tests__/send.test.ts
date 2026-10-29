import { useAuthStore } from '@/backend/auth-store';

import { sendFeedback } from '../send';
import { useFeedbackStore } from '../store';

const mockUploads: { bucket: string; path: string; contentType?: string }[] = [];
let mockUploadError: { message: string; statusCode?: string } | null = null;
const mockSignIn = jest.fn(async () => {});

jest.mock('@/backend/client', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, _body: ArrayBuffer, options?: { contentType?: string }) => {
          if (mockUploadError) return { data: null, error: mockUploadError };
          mockUploads.push({ bucket, path, contentType: options?.contentType });
          return { data: { path }, error: null };
        },
      }),
    },
  },
  isBackendConfigured: true,
}));
jest.mock('@/backend/sync', () => ({ syncNow: jest.fn(async () => {}) }));
jest.mock('@/backend/auth-store', () => {
  const { create } = jest.requireActual('zustand');
  return { useAuthStore: create(() => ({ userId: null })), signInAnonymously: () => mockSignIn() };
});
jest.mock('../read-recording', () => ({
  readRecording: async () => ({ bytes: new ArrayBuffer(8), contentType: 'audio/mp4', extension: '.m4a' }),
}));

describe('sendFeedback', () => {
  beforeEach(() => {
    mockUploads.length = 0;
    mockUploadError = null;
    mockSignIn.mockClear();
    useFeedbackStore.setState({ entries: [] });
    useAuthStore.setState({ userId: 'user-1' });
  });

  it('saves written feedback without uploading anything', async () => {
    await sendFeedback(' More breathing exercises, please ', null);

    expect(mockUploads).toHaveLength(0);
    expect(useFeedbackStore.getState().entries[0]).toMatchObject({
      message: 'More breathing exercises, please',
      sessionId: null,
      emotionId: null,
    });
    expect(useFeedbackStore.getState().entries[0].audioPath).toBeUndefined();
  });

  it("uploads a voice message into the person's folder, then saves the feedback with its path", async () => {
    await sendFeedback('', { uri: 'file:///cache/recording.m4a', durationMs: 83_412.4 });

    const entry = useFeedbackStore.getState().entries[0];
    expect(mockUploads).toEqual([{ bucket: 'feedback-audio', path: `user-1/${entry.id}.m4a`, contentType: 'audio/mp4' }]);
    expect(entry).toMatchObject({ message: '', audioPath: `user-1/${entry.id}.m4a`, audioDurationMs: 83_412 });
  });

  it('never stores more than 5 minutes', async () => {
    await sendFeedback('Hi', { uri: 'file:///r.m4a', durationMs: 300_250 });
    expect(useFeedbackStore.getState().entries[0].audioDurationMs).toBe(300_000);
  });

  it('counts a file that is already there as uploaded, for a retry after a lost response', async () => {
    mockUploadError = { message: 'The resource already exists', statusCode: '409' };
    await sendFeedback('', { uri: 'file:///r.m4a', durationMs: 1000 });
    expect(useFeedbackStore.getState().entries).toHaveLength(1);
  });

  it('saves nothing when the voice message fails to upload, so the person can try again', async () => {
    mockUploadError = { message: 'Network request failed' };
    await expect(sendFeedback('Hello', { uri: 'file:///r.m4a', durationMs: 1000 })).rejects.toBeTruthy();
    expect(useFeedbackStore.getState().entries).toHaveLength(0);
  });

  it('tries to get a guest account first, and fails without one', async () => {
    useAuthStore.setState({ userId: null });
    await expect(sendFeedback('', { uri: 'file:///r.m4a', durationMs: 1000 })).rejects.toThrow('Not connected');
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(useFeedbackStore.getState().entries).toHaveLength(0);
  });
});
