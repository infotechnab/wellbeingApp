import { Platform, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { BADGE_FILL, deepen, EmotionGlyph } from '@/components/emotion-icon';
import { EMOTION_INK, EMOTIONS, WHEEL_ORDER, type EmotionId } from '@/content';
import { usePalette } from '@/theme';

import { petalPath, polar } from './geometry';

type Props = {
  size: number;
  selected: EmotionId | null;
  onSelect: (id: EmotionId) => void;
};

const FONT_FAMILY = Platform.select({ web: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' });
/** How far the chosen petal moves out from the centre. */
const POP = 5;

/**
 * The emotion wheel from the design reference: soft pastel petals, each with its icon in a white
 * badge and its name underneath, around a "Not sure" centre.
 */
export function EmotionWheel({ size, selected, onSelect }: Props) {
  const palette = usePalette();
  const c = size / 2;
  const outer = size / 2 - POP - 3;
  const inner = outer * 0.34;
  const gap = Math.max(6, size * 0.022);
  const slice = 360 / WHEEL_ORDER.length;
  const badge = Math.round(size * 0.125);
  const fontSize = Math.max(10.5, Math.round(size / 29));
  // Soft outlines in a deeper shade of each petal's own colour, rather than one hard grey line.
  const outline = (color: string) => ({ stroke: deepen(color), strokeOpacity: 0.65, strokeWidth: 1.6 });
  const chosenOutline = { stroke: palette.primary, strokeOpacity: 1, strokeWidth: 3 };
  // The badge and name sit together around the petal's centre of area, which lies a little outside
  // the middle of the ring.
  const centreRadius = ((inner + outer) / 2) * 1.05;
  const blockHeight = badge + 4 + fontSize;

  const dim = (id: EmotionId) => (selected !== null && selected !== id ? 0.5 : 1);

  return (
    <View accessible={false} style={{ width: size, height: size, alignSelf: 'center' }} testID="emotion-wheel">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {WHEEL_ORDER.map((id, i) => {
          const emotion = EMOTIONS[id];
          const start = i * slice - slice / 2;
          const end = start + slice;
          const mid = i * slice;
          const isSelected = selected === id;
          const shift = isSelected ? polar(0, 0, POP, mid) : { x: 0, y: 0 };
          const centre = polar(c, c, centreRadius, mid);
          const top = centre.y - blockHeight / 2;
          const badgeY = top + badge / 2;
          return (
            <G key={id} onPress={() => onSelect(id)} opacity={dim(id)} transform={`translate(${shift.x} ${shift.y})`}>
              <Path
                d={petalPath(c, c, inner, outer, start, end, gap, size * 0.08, size * 0.035)}
                fill={emotion.color}
                {...(isSelected ? chosenOutline : outline(emotion.color))}
                strokeLinejoin="round"
              />
              <Circle cx={centre.x} cy={badgeY} r={badge / 2} fill={BADGE_FILL} {...outline(emotion.color)} />
              <EmotionGlyph id={id} x={centre.x} y={badgeY} size={badge * 0.68} />
              <SvgText
                x={centre.x}
                y={top + badge + 4 + fontSize * 0.8}
                fontFamily={FONT_FAMILY}
                fill={EMOTION_INK}
                fontSize={fontSize}
                fontWeight={isSelected ? '700' : '600'}
                textAnchor="middle">
                {emotion.name}
              </SvgText>
            </G>
          );
        })}
        <G onPress={() => onSelect('confused')} opacity={dim('confused')}>
          <Circle
            cx={c}
            cy={c}
            r={inner - gap / 2}
            fill={BADGE_FILL}
            {...(selected === 'confused' ? chosenOutline : outline(EMOTIONS.confused.color))}
          />
          <EmotionGlyph id="confused" x={c} y={c - inner * 0.2} size={inner * 0.95} fill={EMOTION_INK} />
          <SvgText
            x={c}
            y={c + inner * 0.52}
            fontFamily={FONT_FAMILY}
            fill={EMOTION_INK}
            fontSize={fontSize}
            fontWeight={selected === 'confused' ? '700' : '600'}
            textAnchor="middle">
            {EMOTIONS.confused.name}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
