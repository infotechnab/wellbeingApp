import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { breathStateAt, EMOTIONS, type Activity } from '@/content';
import { radius, spacing, usePalette } from '@/theme';

import { Buddy } from './buddy';
import { GroundingPanel } from './grounding-panel';
import { SharePanel } from './share-panel';
import { TimerRing } from './timer-ring';
import { WritePanel } from './write-panel';

export type ActivityVisualProps = {
  activity: Activity;
  /** Seconds left, or undefined for untimed activities. */
  remaining?: number;
  /** Total length in seconds, or undefined for untimed activities. */
  total?: number;
  /** Seconds since the current run started. */
  elapsedSec: number;
  running: boolean;
  done: boolean;
  size: number;
  onComplete: () => void;
  onSaveNote: (text: string) => void;
};

const PHASE_LABEL = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out' } as const;

/** Activity kinds whose running state is an interactive panel instead of a countdown. */
export const INTERACTIVE_KINDS = new Set<Activity['kind']>(['share', 'write', 'grounding']);

export function ActivityVisual(props: ActivityVisualProps) {
  const { activity, remaining, total, elapsedSec, running, done, size, onComplete, onSaveNote } = props;
  const palette = usePalette();
  const color = EMOTIONS[activity.emotionId].color;
  const active = running || (!done && elapsedSec > 0);

  if (INTERACTIVE_KINDS.has(activity.kind) && running) {
    switch (activity.kind) {
      case 'share':
        return <SharePanel templates={activity.templates ?? []} onShared={onComplete} />;
      case 'write':
        return <WritePanel placeholder={activity.placeholder} onSave={onSaveNote} />;
      case 'grounding':
        return <GroundingPanel steps={activity.steps ?? []} onAllChecked={onComplete} />;
    }
  }

  if (activity.kind === 'focus-dot' && active) {
    return (
      <View style={styles.center}>
        <View style={[styles.whiteScreen, { width: size, height: size }]} accessibilityLabel="A single dot to rest your eyes on">
          <View style={styles.dot} />
        </View>
        <AppText variant="caption" muted>
          {remaining}s
        </AppText>
      </View>
    );
  }

  if (total === undefined) {
    return (
      <View style={styles.center}>
        <Buddy size={size * 0.6} color={color} />
        {done ? (
          <AppText variant="label" style={{ color: palette.success }}>
            ✓ Done
          </AppText>
        ) : null}
      </View>
    );
  }

  const left = remaining ?? total;
  const breath = activity.breath ? breathStateAt(activity.breath, elapsedSec) : null;
  const breathScale = breath && active && !done ? (breath.phase === 'in' ? 1.12 : breath.phase === 'out' ? 0.94 : undefined) : 1;
  const remainingInPhase = breath ? Math.max(0, Math.ceil(breath.phaseSec * (1 - breath.phaseProgress))) : 0;

  return (
    <View style={styles.center}>
      <TimerRing size={size} progress={(total - left) / total}>
        {activity.kind === 'prompt' ? (
          <View style={[styles.promptBubble, { backgroundColor: color }]}>
            <AppText variant="hero" style={styles.ink}>
              {done ? '✓' : left}
            </AppText>
          </View>
        ) : (
          <>
            <Buddy
              size={size * 0.48}
              color={color}
              scale={breathScale ?? 1.12}
              durationMs={breath && running ? remainingInPhase * 1000 : 400}
            />
            <AppText variant="title" accessibilityLabel={done ? 'Done' : `${left} seconds left`}>
              {done ? '✓' : left}
            </AppText>
          </>
        )}
      </TimerRing>
      {breath && active && !done ? (
        <AppText variant="lead" accessibilityLiveRegion="polite">
          {PHASE_LABEL[breath.phase]} · {remainingInPhase}
          <AppText muted>{`   round ${breath.round} of ${activity.breath!.rounds}`}</AppText>
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.md, width: '100%' },
  whiteScreen: { backgroundColor: '#FFFFFF', borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2F3437' },
  promptBubble: { width: '70%', aspectRatio: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  ink: { color: '#2F3437' },
});
