import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
  type RecordingStatus,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { radius, spacing, usePalette } from '@/theme';
import { formatDuration } from '@/utils/format';

import type { VoiceMessage } from './send';
import { VOICE_MAX_SECONDS } from './store';

/** Speech doesn't need music quality: mono at 64 kbps keeps 5 minutes under 3 MB. */
export const VOICE_RECORDING: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64000,
  web: { mimeType: 'audio/webm', bitsPerSecond: 64000 },
};

const LIMIT_MS = VOICE_MAX_SECONDS * 1000;

type Props = {
  voice: VoiceMessage | null;
  onChange: (voice: VoiceMessage | null) => void;
  /** True while recording, so the screen can hold off sending. */
  onRecordingChange: (recording: boolean) => void;
  disabled?: boolean;
};

/** Records one voice message of up to 5 minutes, which the person can play back or delete. */
export function VoiceRecorder({ voice, onChange, onRecordingChange, disabled }: Props) {
  const palette = usePalette();
  const [phase, setPhase] = useState<'idle' | 'starting' | 'recording'>('idle');
  const [problem, setProblem] = useState<string | null>(null);
  const durationMs = useRef(0);

  // The recorder keeps the listener it was created with, so that listener calls the current handler.
  const handleStatus = useRef<(status: RecordingStatus) => void>(() => {});
  const recorder = useAudioRecorder(VOICE_RECORDING, (status) => handleStatus.current(status));
  const recorderState = useAudioRecorderState(recorder, 250);

  const player = useAudioPlayer(voice ? { uri: voice.uri } : null);
  const playback = useAudioPlayerStatus(player);

  useEffect(() => {
    handleStatus.current = (status) => {
      // A recording has ended: Stop was tapped, or it reached 5 minutes.
      if (!status.isFinished) return;
      setPhase('idle');
      onRecordingChange(false);
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      if (status.hasError || !status.url) {
        setProblem('The recording stopped unexpectedly. Please try again.');
        return;
      }
      // The last reading can be a moment short of the limit when the recording stopped itself.
      onChange({ uri: status.url, durationMs: durationMs.current > LIMIT_MS - 1000 ? LIMIT_MS : durationMs.current });
    };
  });

  useEffect(() => {
    if (recorderState.isRecording) durationMs.current = recorderState.durationMillis;
  }, [recorderState.isRecording, recorderState.durationMillis]);

  // Leaving the screen mid-recording throws the recording away and frees the microphone.
  useEffect(
    () => () => {
      try {
        if (recorder.isRecording) recorder.stop().catch(() => {});
      } catch {
        // Already released.
      }
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    },
    [recorder],
  );

  const start = async () => {
    setProblem(null);
    setPhase('starting');
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setPhase('idle');
        setProblem(
          Platform.OS === 'web'
            ? 'To record, allow this page to use your microphone.'
            : 'To record, allow Wellbeing to use the microphone in your phone’s Settings.',
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      durationMs.current = 0;
      recorder.record({ forDuration: VOICE_MAX_SECONDS });
      setPhase('recording');
      onRecordingChange(true);
    } catch {
      setPhase('idle');
      setProblem('Couldn’t start recording. Please try again.');
    }
  };

  const stop = async () => {
    durationMs.current = recorder.getStatus().durationMillis || durationMs.current;
    try {
      await recorder.stop();
    } catch {
      setPhase('idle');
      onRecordingChange(false);
      setProblem('The recording stopped unexpectedly. Please try again.');
    }
  };

  const togglePlayback = () => {
    if (playback.playing) {
      player.pause();
    } else if (playback.duration > 0 && playback.currentTime >= playback.duration - 0.1) {
      // Finished: play again from the start.
      player.seekTo(0).then(() => player.play(), () => {});
    } else {
      player.play();
    }
  };

  if (phase === 'recording') {
    return (
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.danger }]}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: palette.danger }]} />
          <AppText>
            Recording {formatDuration(recorderState.durationMillis)} / {formatDuration(LIMIT_MS)}
          </AppText>
        </View>
        <Button label="Stop" kind="secondary" onPress={stop} />
      </View>
    );
  }

  if (voice) {
    const position = playback.playing || playback.currentTime > 0 ? `${formatDuration(playback.currentTime * 1000)} / ` : '';
    return (
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <AppText variant="label">Voice message</AppText>
        <AppText variant="caption" muted>
          {position}
          {formatDuration(voice.durationMs)}
        </AppText>
        <View style={styles.row}>
          <Button
            label={playback.playing ? 'Pause' : 'Play'}
            kind="secondary"
            onPress={togglePlayback}
            disabled={disabled}
            style={styles.grow}
          />
          <Button
            label="Delete"
            kind="ghost"
            disabled={disabled}
            onPress={() => {
              player.pause();
              onChange(null);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.idle}>
      <Button
        label={phase === 'starting' ? 'Starting…' : 'Record a voice message'}
        kind="secondary"
        onPress={start}
        disabled={disabled || phase === 'starting'}
      />
      <AppText variant="caption" muted center>
        Up to 5 minutes.
      </AppText>
      {problem ? (
        <AppText variant="caption" style={{ color: palette.danger }}>
          {problem}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  idle: { gap: spacing.xs },
  card: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  grow: { flex: 1 },
});
