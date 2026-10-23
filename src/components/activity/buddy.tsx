import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { EMOTION_INK } from '@/content';

type Props = {
  size: number;
  color: string;
  /** Target body scale, e.g. larger on an in-breath. The change is animated over `durationMs`. */
  scale?: number;
  durationMs?: number;
};

/**
 * A small, calm character that demonstrates the activity. Its chest and shoulders grow and settle
 * with the breath. Placeholder art drawn in code until designed illustrations are available.
 */
export function Buddy({ size, color, scale = 1, durationMs = 600 }: Props) {
  const body = useSharedValue(scale);

  useEffect(() => {
    body.value = withTiming(scale, { duration: durationMs, easing: Easing.inOut(Easing.sin) });
  }, [scale, durationMs, body]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + (body.value - 1) * 0.6 }, { scaleY: body.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, bodyStyle]} accessible={false}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path
          d="M18 120 C20 92 38 82 60 82 C82 82 100 92 102 120 Z"
          fill={color}
          stroke={EMOTION_INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d="M52 74 L52 84 M68 74 L68 84" stroke={EMOTION_INK} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={60} cy={48} r={27} fill={color} stroke={EMOTION_INK} strokeWidth={2} />
        <Path d="M46 46 Q50 50 54 46 M66 46 Q70 50 74 46" stroke={EMOTION_INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M52 58 Q60 64 68 58" stroke={EMOTION_INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx={44} cy={55} r={3.5} fill="#F4A6A0" opacity={0.6} />
        <Circle cx={76} cy={55} r={3.5} fill="#F4A6A0" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}
