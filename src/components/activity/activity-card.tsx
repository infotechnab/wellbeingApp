import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { activityDurationSec, type Activity } from '@/content';
import { useNow } from '@/hooks/use-now';
import { useNotesStore } from '@/journal/notes-store';
import { elapsedMs, type ActivityProgress, type Reaction } from '@/session/model';
import { spacing } from '@/theme';

import { ActivityVisual, INTERACTIVE_KINDS } from './activity-visual';
import { ReactionButtons } from './reaction-buttons';

export type ActivityCardProps = {
  activity: Activity;
  progress: ActivityProgress;
  visualSize: number;
  isLast: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onRedo: () => void;
  onReact: (reaction: Reaction) => void;
  onNext: () => void;
};

export function ActivityCard({
  activity,
  progress,
  visualSize,
  isLast,
  onStart,
  onPause,
  onResume,
  onComplete,
  onRedo,
  onReact,
  onNext,
}: ActivityCardProps) {
  const running = progress.status === 'running';
  const done = progress.status === 'done';
  const now = useNow(running);
  const total = activityDurationSec(activity);
  const elapsedSec = elapsedMs(progress, now) / 1000;
  const remaining = total === undefined ? undefined : Math.max(0, Math.ceil(total - elapsedSec));

  // Timed activities finish on their own when the countdown reaches zero.
  useEffect(() => {
    if (running && remaining === 0) onComplete();
  }, [running, remaining, onComplete]);

  const primary = (() => {
    switch (progress.status) {
      case 'idle':
        return { label: 'Start', onPress: onStart };
      case 'running':
        return total === undefined ? { label: 'Done', onPress: onComplete } : { label: 'Pause', onPress: onPause };
      case 'paused':
        return { label: 'Resume', onPress: onResume };
      case 'done':
        return { label: '↻ Redo', onPress: onRedo };
    }
  })();

  // Share, write and grounding panels carry their own actions while open.
  const showPrimary = !(INTERACTIVE_KINDS.has(activity.kind) && running);

  const saveNote = (text: string) => {
    useNotesStore.getState().add({ text, activityId: activity.id, emotionId: activity.emotionId });
    onComplete();
  };

  const secondaryLabel = done ? (isLast ? 'Finish' : 'Next') : 'Skip for now';

  return (
    <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <AppText variant="title" center>
          {activity.title}
        </AppText>
        <AppText variant="lead" muted center>
          {activity.instruction}
        </AppText>
      </View>

      <View style={styles.visual}>
        <ActivityVisual
          activity={activity}
          progress={progress}
          remaining={remaining}
          total={total}
          elapsedSec={elapsedSec}
          size={visualSize}
          onComplete={onComplete}
          onSaveNote={saveNote}
        />
      </View>

      <View style={styles.actions}>
        {showPrimary ? <Button label={primary.label} onPress={primary.onPress} style={styles.primary} /> : null}
        <ReactionButtons value={progress.reaction} onToggle={onReact} />
        <Button label={secondaryLabel} kind="ghost" onPress={onNext} />
      </View>

      {activity.research ? (
        <AppText variant="caption" muted center>
          {activity.research}
        </AppText>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, gap: spacing.lg, justifyContent: 'space-between', paddingBottom: spacing.md },
  header: { gap: spacing.sm },
  visual: { alignItems: 'center', justifyContent: 'center' },
  actions: { gap: spacing.md, alignItems: 'center' },
  primary: { minWidth: 180 },
});
