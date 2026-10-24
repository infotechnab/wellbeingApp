import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { activityTimeline, EMOTIONS, EMOTION_INK, guideOutline, previewTimeline, stepAt, type Activity, type StepState } from '@/content';
import { useFrameClock } from '@/hooks/use-frame-clock';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { elapsedMs, type ActivityProgress } from '@/session/model';
import { radius, spacing, useIsDark, usePalette } from '@/theme';

import { TimerRing } from '../timer-ring';
import { GuideFigure, type FigureColors } from './figure';
import { figureAt, poseState, type FigureState } from './pose';

type Props = {
  activity: Activity;
  progress: ActivityProgress;
  /** Seconds into the activity, refreshed by the card a few times a second. */
  elapsedSec: number;
  /** Seconds left, or undefined for untimed activities. */
  remaining?: number;
  /** Total length in seconds, or undefined for untimed activities. */
  total?: number;
  size: number;
};

/**
 * Shows how to do an activity: before it starts, an animated demo loops beside a short "How it
 * works" list; while it runs, the figure acts out each step in time with a big cue line.
 */
export function GuideVisual({ activity, progress, elapsedSec, remaining, total, size }: Props) {
  const palette = usePalette();
  const dark = useIsDark();
  const reduceMotion = useReduceMotion();
  const status = progress.status;
  const timeline = useMemo(() => activityTimeline(activity), [activity]);
  const preview = useMemo(() => previewTimeline(activity), [activity]);
  const outline = useMemo(() => guideOutline(activity), [activity]);
  const [shownAt] = useState(() => Date.now());

  // Animate on every frame unless the user prefers reduced motion; a paused activity stands still.
  const animate = !reduceMotion && status !== 'paused';
  const now = useFrameClock(animate);

  const colors: FigureColors = {
    body: EMOTIONS[activity.emotionId].color,
    ink: EMOTION_INK,
    mark: dark ? palette.textMuted : '#4A5155',
    bubble: palette.surface,
    icon: palette.text,
    wall: dark ? '#3A4148' : '#E4DED4',
    cloud: dark ? '#5A6168' : '#BDB8B1',
    success: palette.success,
    accent: palette.primary,
  };

  let figure: FigureState;
  let current: StepState | undefined;
  if (status === 'idle') {
    const t = animate && preview.total > 0 ? ((now - shownAt) / 1000) % preview.total : 0;
    current = preview.steps.length > 0 ? stepAt(preview, t) : undefined;
    figure = current ? figureAt(preview, t, { still: !animate, loop: true }) : poseState('stand', { p: 0, t, still: true });
  } else if (status === 'done') {
    figure = poseState('done', { p: 1, t: (now - shownAt) / 1000, still: !animate });
  } else {
    const t = animate ? elapsedMs(progress, now) / 1000 : elapsedSec;
    current = timeline.steps.length > 0 ? stepAt(timeline, t) : undefined;
    figure = current ? figureAt(timeline, t, { still: !animate }) : poseState('stand', { p: 0, t, still: true });
  }

  // Android and the web read the cue's live region aloud; iOS needs an explicit announcement.
  const runningCue = status === 'running' ? current?.step.cue : undefined;
  const runningStep = status === 'running' ? current?.index : undefined;
  useEffect(() => {
    if (Platform.OS === 'ios' && runningCue) AccessibilityInfo.announceForAccessibility(runningCue);
  }, [runningCue, runningStep]);

  const dotScreen = activity.kind === 'focus-dot';
  const label = current ? `Animation: ${current.step.cue}` : `Animation for ${activity.title}`;

  const stage = (diameter: number) =>
    dotScreen ? (
      <View style={[styles.dotScreen, { width: diameter, height: diameter }]} accessibilityLabel="A single dot to rest your eyes on">
        <View style={styles.dot} />
      </View>
    ) : (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        style={[styles.stage, { width: diameter, height: diameter, borderRadius: diameter / 2, backgroundColor: palette.surfaceMuted }]}>
        <GuideFigure state={figure} colors={colors} size={diameter} />
      </View>
    );

  if (status === 'idle' || (status === 'done' && total === undefined)) {
    return (
      <View style={styles.center}>
        {stage(Math.round(size * 0.8))}
        {status === 'done' ? (
          <AppText variant="label" style={{ color: palette.success }}>
            ✓ Done
          </AppText>
        ) : (
          <View style={styles.outline}>
            <AppText variant="caption" muted center>
              How it works
            </AppText>
            {outline.items.map((item, i) => {
              const active = current?.index === i;
              return (
                <View key={`${i}-${item.cue}`} style={[styles.row, active && { backgroundColor: palette.primarySoft }]}>
                  <View style={[styles.number, { backgroundColor: active ? palette.primary : palette.surfaceMuted }]}>
                    <AppText variant="caption" style={{ color: active ? palette.onPrimary : palette.textMuted, fontWeight: '700' }}>
                      {i + 1}
                    </AppText>
                  </View>
                  <AppText style={styles.rowText}>{item.cue}</AppText>
                  {item.seconds ? (
                    <AppText variant="caption" muted>
                      {item.seconds}s
                    </AppText>
                  ) : null}
                </View>
              );
            })}
            {outline.repeat > 1 ? (
              <AppText variant="caption" muted center>
                ↻ Repeat {outline.repeat} times
              </AppText>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  const done = status === 'done';
  const left = remaining ?? total ?? 0;
  const ringProgress = total ? (done ? 1 : (total - left) / total) : 0;
  const where =
    timeline.rounds > 1
      ? `Round ${current?.step.round ?? 1} of ${timeline.rounds}`
      : timeline.steps.length > 1
        ? `Step ${(current?.index ?? 0) + 1} of ${timeline.steps.length}`
        : '';
  const detail = [status === 'paused' ? 'Paused' : `${current?.left ?? left}s`, where].filter(Boolean).join(' · ');

  return (
    <View style={styles.center}>
      {dotScreen ? (
        stage(size)
      ) : (
        <TimerRing size={size} progress={ringProgress} padding={16}>
          {stage(size - 32)}
        </TimerRing>
      )}
      {done ? (
        <AppText variant="label" style={{ color: palette.success }}>
          ✓ Done
        </AppText>
      ) : current ? (
        <View style={styles.cue}>
          <AppText variant="title" center accessibilityLiveRegion="polite">
            {current.step.cue}
          </AppText>
          <AppText variant="caption" muted center>
            {detail}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.md, width: '100%' },
  stage: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  dotScreen: { backgroundColor: '#FFFFFF', borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2F3437' },
  outline: { width: '100%', maxWidth: 360, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  number: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  cue: { gap: spacing.xs, alignItems: 'center', minHeight: 56 },
});
