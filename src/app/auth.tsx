import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { signIn, signUp } from '@/backend/auth-store';
import { validateCredentials } from '@/backend/validation';
import { useToast } from '@/components/toast';
import { AppText, Button, Screen } from '@/components/ui';
import { fontSize, radius, spacing, usePalette } from '@/theme';

type Mode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const palette = usePalette();
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'sign-in' ? 'sign-in' : 'sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast((s) => s.show);

  const submit = async () => {
    const problem = validateCredentials(email, password);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    const result = mode === 'sign-up' ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast(
      mode === 'sign-in'
        ? 'Welcome back!'
        : result.needsConfirmation
          ? 'Check your email to confirm your account.'
          : 'Your account is ready.',
    );
    router.back();
  };

  const inputStyle = [styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }];

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <AppText muted>‹ Back</AppText>
        </Pressable>

        <View style={styles.content}>
          <AppText variant="title">{mode === 'sign-up' ? 'Create an account' : 'Sign in'}</AppText>
          <AppText muted>
            {mode === 'sign-up'
              ? 'Optional. An account keeps your journal safe and lets you use it on other devices. Everything you have done so far comes with you.'
              : 'Sign in to bring your journal to this device.'}
          </AppText>

          <TextInput
            accessibilityLabel="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={palette.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={inputStyle}
          />
          <TextInput
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password (8+ characters)"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
            style={inputStyle}
            onSubmitEditing={submit}
          />
          {error ? (
            <AppText variant="caption" style={{ color: palette.danger }} accessibilityRole="alert">
              {error}
            </AppText>
          ) : null}

          <Button label={busy ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'} disabled={busy} onPress={submit} />
          <Button
            kind="ghost"
            label={mode === 'sign-up' ? 'I already have an account' : 'Create a new account instead'}
            onPress={() => {
              setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up');
              setError(null);
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { gap: spacing.md, marginTop: spacing.lg },
  input: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.body },
});
