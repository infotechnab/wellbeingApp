import { StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/components/ui';
import { EMOTIONS } from '@/content';
import { useHistoryStore } from '@/session/history';
import { radius, spacing, usePalette } from '@/theme';
import { formatWhen } from '@/utils/format';

export default function JournalScreen() {
  const palette = usePalette();
  const sessions = useHistoryStore((s) => s.sessions);

  return (
    <Screen edges={['top']} scroll>
      <AppText variant="title">Journal</AppText>
      <AppText muted style={styles.intro}>
        Your check-ins stay on this device unless you create an account.
      </AppText>

      {sessions.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: palette.surfaceMuted }]}>
          <AppText center muted>
            Nothing here yet. Your check-ins will appear here after your first session.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {sessions.map((item) => {
            const emotion = EMOTIONS[item.emotionId];
            return (
              <View key={item.id} style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <View style={[styles.swatch, { backgroundColor: emotion.color }]} />
                <View style={{ flex: 1 }}>
                  <AppText variant="label">{emotion.name}</AppText>
                  <AppText variant="caption" muted>
                    {formatWhen(item.endedAt)} · {item.completed} of {item.total} done
                    {item.redos > 0 ? ` · ${item.redos} redo${item.redos === 1 ? '' : 's'}` : ''}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: spacing.xs, marginBottom: spacing.lg },
  empty: { padding: spacing.lg, borderRadius: radius.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  swatch: { width: 28, height: 28, borderRadius: radius.pill },
});
