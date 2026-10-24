import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { usePalette } from '@/theme';

import { polar } from '../wheel/geometry';

type Props = {
  size: number;
  /** 0 to 1. */
  progress: number;
  /** Space between the ring and its content. */
  padding?: number;
  children?: ReactNode;
};

export function TimerRing({ size, progress, padding = 32, children }: Props) {
  const palette = usePalette();
  const stroke = 8;
  const r = size / 2 - stroke;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const dot = polar(c, c, r, clamped * 360);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={r} stroke={palette.primarySoft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={palette.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={[styles.center, { padding }]}>{children}</View>
      {/* The dot goes on top so content that fills the ring doesn't cover it. */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle cx={dot.x} cy={dot.y} r={stroke * 0.95} fill={palette.primary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
