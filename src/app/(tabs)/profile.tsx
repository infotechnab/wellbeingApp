import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { signInAnonymously, signOut, useAuthStore } from '@/backend/auth-store';
import { clearLocalJournal, syncNow } from '@/backend/sync';
import { HelpLink } from '@/components/help-link';
import { useToast } from '@/components/toast';
import { AppText, Button, Screen } from '@/components/ui';
import { useHistoryStore } from '@/session/history';
import { useSketchStore } from '@/sketch/store';
import { radius, spacing, usePalette } from '@/theme';

export default function ProfileScreen() {
  const palette = usePalette();
  const { status, email } = useAuthStore();
  const checkIns = useHistoryStore((s) => s.sessions.length);
  const sketches = useSketchStore((s) => s.sketches.length);
  const showToast = useToast((s) => s.show);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    // Upload anything pending first so nothing is lost, then remove personal data from the device.
    await syncNow().catch(() => undefined);
    await signOut();
    clearLocalJournal();
    await signInAnonymously();
    setBusy(false);
    showToast('You have been logged out.');
  };

  const signedIn = status === 'signed-in';

  return (
    <Screen edges={['top']} scroll>
      <AppText variant="title">Profile</AppText>

      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
          <AppText variant="title" style={{ color: palette.primary }}>
            {signedIn && email ? email[0].toUpperCase() : '☺'}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label">{signedIn ? email : 'Guest'}</AppText>
          <AppText variant="caption" muted>
            {signedIn ? 'Your journal is backed up to your account.' : 'Using the app without an account.'}
          </AppText>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="Check-ins" value={checkIns} />
        <Stat label="Sketches" value={sketches} />
      </View>

      {status === 'disabled' ? (
        <AppText muted variant="caption">
          Accounts aren’t switched on in this build. Everything is saved on this device.
        </AppText>
      ) : signedIn ? (
        <Button label={busy ? 'Logging out…' : 'Log out'} kind="secondary" disabled={busy} onPress={logout} />
      ) : (
        <View style={styles.actions}>
          <Button label="Create an account" onPress={() => router.push({ pathname: '/auth', params: { mode: 'sign-up' } })} />
          <Button label="Sign in" kind="secondary" onPress={() => router.push({ pathname: '/auth', params: { mode: 'sign-in' } })} />
          <AppText variant="caption" muted center>
            Signing up is optional. You can keep using everything as a guest.
          </AppText>
        </View>
      )}

      <View style={[styles.about, { borderTopColor: palette.border }]}>
        <AppText variant="label">About and privacy</AppText>
        <AppText variant="caption" muted>
          Your check-ins, sketches and notes are saved on this device. With an account they are also backed
          up privately, and nobody else can see them. Feedback you send and anonymous activity likes help us
          improve the exercises.
        </AppText>
        <AppText variant="caption" muted>
          This app supports everyday wellbeing and is not a medical service.
        </AppText>
        <HelpLink />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const palette = usePalette();
  return (
    <View style={[styles.stat, { backgroundColor: palette.surfaceMuted }]}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
  stat: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  actions: { gap: spacing.sm },
  about: { gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1 },
});
