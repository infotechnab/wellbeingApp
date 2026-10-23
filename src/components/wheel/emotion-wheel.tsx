import { Platform, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { EMOTION_INK, EMOTIONS, WHEEL_ORDER, type EmotionId } from '@/content';
import { usePalette } from '@/theme';

import { polar, ringSegment } from './geometry';

type Props = {
  size: number;
  selected: EmotionId | null;
  onSelect: (id: EmotionId) => void;
};

const GAP_DEG = 3;
const FONT_FAMILY = Platform.select({ web: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' });

export function EmotionWheel({ size, selected, onSelect }: Props) {
  const palette = usePalette();
  const c = size / 2;
  const outer = size / 2 - 6;
  const inner = outer * 0.36;
  const slice = 360 / WHEEL_ORDER.length;
  const labelRadius = (outer + inner) / 2;
  const fontSize = Math.max(11, Math.round(size / 26));

  return (
    <View
      accessible={false}
      style={{ width: size, height: size, alignSelf: 'center' }}
      testID="emotion-wheel">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {WHEEL_ORDER.map((id, i) => {
          const emotion = EMOTIONS[id];
          const start = i * slice - slice / 2 + GAP_DEG / 2;
          const end = start + slice - GAP_DEG;
          const mid = (start + end) / 2;
          const label = polar(c, c, labelRadius, mid);
          const isSelected = selected === id;
          const dimmed = selected !== null && !isSelected;
          return (
            <G key={id} onPress={() => onSelect(id)} opacity={dimmed ? 0.55 : 1}>
              <Path
                d={ringSegment(c, c, inner, isSelected ? outer : outer - 4, start, end)}
                fill={emotion.color}
                stroke={isSelected ? palette.primary : palette.background}
                strokeWidth={isSelected ? 3 : 2}
                strokeLinejoin="round"
              />
              <SvgText
                x={label.x}
                y={label.y + fontSize / 3}
                fontFamily={FONT_FAMILY}
                fill={EMOTION_INK}
                fontSize={fontSize}
                fontWeight={isSelected ? '700' : '500'}
                textAnchor="middle">
                {emotion.name}
              </SvgText>
            </G>
          );
        })}
        <G onPress={() => onSelect('confused')} opacity={selected !== null && selected !== 'confused' ? 0.55 : 1}>
          <Circle
            cx={c}
            cy={c}
            r={inner - 6}
            fill={EMOTIONS.confused.color}
            stroke={selected === 'confused' ? palette.primary : palette.background}
            strokeWidth={selected === 'confused' ? 3 : 2}
          />
          <SvgText x={c} y={c + inner * 0.18} fontFamily={FONT_FAMILY} fill={EMOTION_INK} fontSize={inner * 0.6} fontWeight="300" textAnchor="middle">
            ?
          </SvgText>
          <SvgText x={c} y={c + inner * 0.48} fontFamily={FONT_FAMILY} fill={EMOTION_INK} fontSize={fontSize * 0.85} textAnchor="middle">
            Not sure
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
