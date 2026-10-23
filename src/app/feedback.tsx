import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { useToast } from '@/components/toast';
import { AppText, Button, Screen } from '@/components/ui';
import { FEEDBACK_MAX_LENGTH, useFeedbackStore, validateFeedback } from '@/feedback/store';
import { useSessionStore } from '@/session/store';
import { fontSize, radius, spacing, usePalette } from '@/theme';

export default function FeedbackScreen() {
  const palette = usePalette();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const addFeedback = useFeedbackStore((s) => s.add);
  const showToast = useToast((s) => s.show);

  // Clear the finished session so the next emotion starts a fresh queue.
  const backToWheel = () => {
    useSessionStore.getState().end();
    router.replace('/home');
  };

  const submit = () => {
    const problem = validateFeedback(text);
    if (problem) {
      setError(problem);
      return;
    }
    const session = useSessionStore.getState().session;
    addFeedback({ message: text, sessionId: session?.id ?? null, emotionId: session?.emotionId ?? null });
    showToast('Thank you for your feedback!');
    backToWheel();
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <View style={styles.content}>
          <AppText variant="title" center>
            Well done for taking this time
          </AppText>
          <AppText muted center>
            How did that feel? Anything you share helps us make the app kinder. This is optional.
          </AppText>

          <TextInput
            accessibilityLabel="Your feedback"
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (error) setError(null);
            }}
            placeholder="Write your thoughts…"
            placeholderTextColor={palette.textMuted}
            multiline
            maxLength={FEEDBACK_MAX_LENGTH}
            textAlignVertical="top"
            style={[
              styles.input,
              { color: palette.text, backgroundColor: palette.surface, borderColor: error ? palette.danger : palette.border },
            ]}
          />
          {error ? (
            <AppText variant="caption" style={{ color: palette.danger }}>
              {error}
            </AppText>
          ) : (
            <AppText variant="caption" muted style={{ textAlign: 'right' }}>
              {text.length}/{FEEDBACK_MAX_LENGTH}
            </AppText>
          )}
        </View>

        <View style={styles.actions}>
          <Button label="Submit" onPress={submit} />
          <Button label="No thanks" kind="ghost" onPress={backToWheel} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'space-between' },
  content: { gap: spacing.md, marginTop: spacing.xl },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.body,
  },
  actions: { gap: spacing.sm, paddingBottom: spacing.md },
});
