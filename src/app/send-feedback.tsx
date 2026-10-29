import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { isBackendConfigured } from '@/backend/client';
import { HelpLink } from '@/components/help-link';
import { useToast } from '@/components/toast';
import { AppText, Button, Screen } from '@/components/ui';
import { sendFeedback, type VoiceMessage } from '@/feedback/send';
import { countWords, FEEDBACK_MAX_LENGTH, FEEDBACK_MAX_WORDS, feedbackLengthProblem } from '@/feedback/store';
import { VoiceRecorder } from '@/feedback/voice-recorder';
import { fontSize, radius, spacing, usePalette } from '@/theme';

/** Feedback from Profile: a written message of up to 200 words, a voice message of up to 5 minutes, or both. */
export default function SendFeedbackScreen() {
  const palette = usePalette();
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceMessage | null>(null);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast((s) => s.show);
  const words = countWords(text);

  const send = async () => {
    const problem =
      feedbackLengthProblem(text) ?? (!text.trim() && !voice ? 'Write a message or record a voice message first.' : null);
    if (problem) {
      setError(problem);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendFeedback(text, voice);
      showToast('Thank you for your feedback!');
      router.back();
    } catch {
      // Only a voice message can fail: written feedback is saved on the device and uploads later.
      setSending(false);
      setError('Couldn’t send your voice message. Check your connection and try again.');
    }
  };

  return (
    <Screen scroll>
      <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
        <AppText muted>‹ Back</AppText>
      </Pressable>

      <View style={styles.content}>
        <AppText variant="title">Send feedback</AppText>
        <AppText muted>
          Tell us what helps and what doesn’t.{' '}
          {isBackendConfigured ? 'Write a message, record a voice message, or both.' : 'Write a message below.'}
        </AppText>

        <View style={styles.field}>
          <TextInput
            accessibilityLabel="Your message"
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (error) setError(null);
            }}
            placeholder="Write your message…"
            placeholderTextColor={palette.textMuted}
            multiline
            maxLength={FEEDBACK_MAX_LENGTH}
            textAlignVertical="top"
            editable={!sending}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.surface,
                borderColor: words > FEEDBACK_MAX_WORDS ? palette.danger : palette.border,
              },
            ]}
          />
          <AppText
            variant="caption"
            style={{ textAlign: 'right', color: words > FEEDBACK_MAX_WORDS ? palette.danger : palette.textMuted }}>
            {words}/{FEEDBACK_MAX_WORDS} words
          </AppText>
        </View>

        {isBackendConfigured ? (
          <VoiceRecorder voice={voice} onChange={setVoice} onRecordingChange={setRecording} disabled={sending} />
        ) : null}

        {error ? (
          <AppText variant="caption" style={{ color: palette.danger }}>
            {error}
          </AppText>
        ) : null}

        <Button label={sending ? 'Sending…' : 'Send'} onPress={send} disabled={sending || recording} />

        <AppText variant="caption" muted>
          Only the Wellbeing team reads and listens to feedback, and not straight away.
        </AppText>
        <HelpLink />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, marginTop: spacing.lg },
  field: { gap: spacing.xs },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.body,
  },
});
