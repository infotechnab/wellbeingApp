import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { Activity } from '@/content';
import { usePalette } from '@/theme';

import { TimerRing } from './timer-ring';

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
};

/** The centre piece of an activity card: a countdown ring for timed activities. */
export function ActivityVisual({ remaining, total, size, done }: ActivityVisualProps) {
  const palette = usePalette();

  if (total === undefined) {
    return (
      <View style={[styles.untimed, { width: size * 0.6, height: size * 0.6, backgroundColor: palette.primarySoft }]}>
        <AppText variant="hero" style={{ color: palette.primary }}>
          {done ? '✓' : '•'}
        </AppText>
      </View>
    );
  }

  const left = remaining ?? total;
  return (
    <TimerRing size={size} progress={(total - left) / total}>
      <AppText variant="hero" accessibilityLabel={`${left} seconds left`}>
        {done ? '✓' : left}
      </AppText>
    </TimerRing>
  );
}

const styles = StyleSheet.create({
  untimed: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
});
