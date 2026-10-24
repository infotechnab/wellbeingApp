import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmotionBadge } from '@/components/emotion-icon';
import { SketchThumbnail } from '@/components/sketch/sketch-thumbnail';
import { AppText, Button, Screen } from '@/components/ui';
import { EMOTIONS } from '@/content';
import { useNotesStore } from '@/journal/notes-store';
import { useHistoryStore } from '@/session/history';
import { useSketchStore } from '@/sketch/store';
import { radius, spacing, usePalette } from '@/theme';
import { formatWhen } from '@/utils/format';

export default function JournalScreen() {
  const palette = usePalette();
  const sessions = useHistoryStore((s) => s.sessions);
  const sketches = useSketchStore((s) => s.sketches);
  const notes = useNotesStore((s) => s.notes);

  return (
    <Screen edges={['top']} scroll>
      <AppText variant="title">Journal</AppText>
      <AppText muted style={styles.intro}>
        Your check-ins and sketches stay on this device unless you create an account.
      </AppText>

      <View style={styles.sectionHeader}>
        <AppText variant="label">Sketches</AppText>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/sketch', params: { from: 'journal' } })}>
          <AppText style={{ color: palette.primary, fontWeight: '600' }}>+ New sketch</AppText>
        </Pressable>
      </View>
      {sketches.length === 0 ? (
        <AppText muted variant="caption" style={styles.gap}>
          No sketches yet.
        </AppText>
      ) : (
        <View style={[styles.grid, styles.gap]}>
          {sketches.map((sketch) => (
            <View key={sketch.id} accessibilityLabel={`Sketch from ${formatWhen(sketch.createdAt)}`}>
              <SketchThumbnail sketch={sketch} size={96} />
              <AppText variant="caption" muted>
                {formatWhen(sketch.createdAt)}
              </AppText>
            </View>
          ))}
        </View>
      )}

      {notes.length > 0 ? (
        <>
          <AppText variant="label" style={styles.sectionHeader}>
            Notes
          </AppText>
          <View style={[styles.list, styles.gap]}>
            {notes.map((note) => (
              <View key={note.id} style={[styles.note, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <AppText>{note.text}</AppText>
                <AppText variant="caption" muted>
                  {formatWhen(note.createdAt)}
                </AppText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <AppText variant="label" style={styles.sectionHeader}>
        Check-ins
      </AppText>
      {sessions.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: palette.surfaceMuted }]}>
          <AppText center muted>
            Nothing here yet. Your check-ins will appear here after your first session.
          </AppText>
          <Button label="Check in now" kind="secondary" onPress={() => router.navigate('/home')} />
        </View>
      ) : (
        <View style={styles.list}>
          {sessions.map((item) => {
            const emotion = EMOTIONS[item.emotionId];
            return (
              <View key={item.id} style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <EmotionBadge id={item.emotionId} size={36} />
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
  intro: { marginTop: spacing.xs, marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  gap: { marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  empty: { padding: spacing.lg, borderRadius: radius.md, gap: spacing.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  note: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
});
