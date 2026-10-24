import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { EMOTION_INK, EMOTIONS, type EmotionId } from '@/content';

/** A deeper shade of a pastel emotion colour, for icon fills that need to stand out on it. */
export function deepen(hex: string): string {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return hsl(h * 60, Math.min(1, s * 1.1), l * 0.72);
}

function hsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((((h % 360) + 360) % 360) / 60) % 2 - 1));
  const m = l - c / 2;
  const sector = Math.floor((((h % 360) + 360) % 360) / 60);
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector];
  const hex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const SPIRAL = 'M12 11a1.6 1.6 0 0 1 3.2 0 3.2 3.2 0 0 1-6.4 0 4.8 4.8 0 0 1 9.6 0 6.4 6.4 0 0 1-12.8 0';

type GlyphProps = {
  id: EmotionId;
  /** Centre of the glyph in the parent SVG's coordinates. */
  x: number;
  y: number;
  size: number;
  fill?: string;
  ink?: string;
};

/**
 * The emotion's icon drawn into an existing SVG, in the line-art style of the design reference: a
 * dark outline around a deeper shade of the emotion's colour.
 */
export function EmotionGlyph({ id, x, y, size, fill = deepen(EMOTIONS[id].color), ink = EMOTION_INK }: GlyphProps) {
  const k = size / 24;
  const line = { stroke: ink, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let content;
  switch (id) {
    case 'joy':
      content = (
        <Path
          d="M12 20.4C5.6 16.2 3 12.6 3 9.3 3 6.7 5 4.8 7.4 4.8c1.9 0 3.6 1.1 4.6 2.8 1-1.7 2.7-2.8 4.6-2.8 2.4 0 4.4 1.9 4.4 4.5 0 3.3-2.6 6.9-9 11.1Z"
          fill={fill}
          {...line}
        />
      );
      break;
    case 'trust':
      // Two people side by side: feeling safe with someone.
      content = (
        <G>
          <Circle cx={15.6} cy={7.8} r={2.8} fill={fill} {...line} />
          <Path d="M10.6 17.4c0.3-3.2 2.4-5.2 5-5.2s4.7 2 5 5.2Z" fill={fill} {...line} />
          <Circle cx={8.8} cy={9.6} r={3.1} fill={fill} {...line} />
          <Path d="M3.2 19.8c0.3-3.6 2.6-5.8 5.6-5.8s5.3 2.2 5.6 5.8Z" fill={fill} {...line} />
        </G>
      );
      break;
    case 'fear':
      content = (
        <G>
          <Path d="M12 3.4l7 2.8v5.3c0 4.3-3 7.5-7 9.3-4-1.8-7-5-7-9.3V6.2Z" fill={fill} {...line} />
          <Path d="M12 6.6l4.2 1.7v3.3c0 2.6-1.7 4.6-4.2 5.8-2.5-1.2-4.2-3.2-4.2-5.8V8.3Z" fill="none" {...line} strokeWidth={1.2} />
        </G>
      );
      break;
    case 'surprise':
      // A spiral, as in the design reference, drawn as an outlined line.
      content = (
        <G fill="none" strokeLinecap="round">
          <Path d={SPIRAL} stroke={ink} strokeWidth={3.4} />
          <Path d={SPIRAL} stroke={fill} strokeWidth={1.7} />
        </G>
      );
      break;
    case 'sadness':
      // A teardrop.
      content = (
        <G>
          <Path d="M12 3.6c2.6 3.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3.4-7.4 6-11Z" fill={fill} {...line} />
          <Path d="M9.3 14.6a2.8 2.8 0 0 0 2.2 2.8" fill="none" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
        </G>
      );
      break;
    case 'disgust':
      // A raised hand: "keep away". The ink silhouette goes underneath so the parts read as one shape.
      content = (
        <G>
          <G stroke={ink} strokeWidth={4.8} strokeLinecap="round">
            <Path d="M8.6 12V6.2M11.2 11V4.8M13.8 11V5.4M16.4 12.4V7.4M6.6 16.2l-2-3" />
          </G>
          <Rect x={6.4} y={10.4} width={11.6} height={10.2} rx={4.4} fill={ink} stroke={ink} strokeWidth={3.2} />
          <G stroke={fill} strokeWidth={1.6} strokeLinecap="round">
            <Path d="M8.6 12V6.2M11.2 11V4.8M13.8 11V5.4M16.4 12.4V7.4M6.6 16.2l-2-3" />
          </G>
          <Rect x={6.4} y={10.4} width={11.6} height={10.2} rx={4.4} fill={fill} />
        </G>
      );
      break;
    case 'anger':
      // A storm cloud with a lightning bolt, as in the design reference.
      content = (
        <G>
          <Path d="M6.6 16.2a3.6 3.6 0 0 1 0.3-7.2 5.1 5.1 0 0 1 9.9-0.5 3.9 3.9 0 0 1 0.6 7.7Z" fill={fill} {...line} />
          <Path d="M13.2 11.2l-3.4 5h2.6l-1.3 5 4.4-6.2h-2.6l1.3-3.8Z" fill="#FFFFFF" {...line} strokeWidth={1.3} />
        </G>
      );
      break;
    case 'anticipation':
      content = (
        <G>
          <Path d="M8 4.6h8c0 4-2.4 5.8-4 7.4 1.6 1.6 4 3.4 4 7.4H8c0-4 2.4-5.8 4-7.4-1.6-1.6-4-3.4-4-7.4Z" fill="#FFFFFF" {...line} />
          <Path d="M9.8 7.4h4.4c-0.5 1.4-1.3 2.2-2.2 2.9-0.9-0.7-1.7-1.5-2.2-2.9ZM9.4 18.8c0.4-1.9 1.4-3.2 2.6-3.6 1.2 0.4 2.2 1.7 2.6 3.6Z" fill={fill} />
          <Path d="M6.6 4.6h10.8M6.6 19.4h10.8" fill="none" {...line} strokeWidth={1.9} />
        </G>
      );
      break;
    case 'confused':
      content = (
        <G>
          <Path d="M9 9.2c0-1.8 1.4-3.1 3.1-3.1 1.8 0 3 1.2 3 2.8 0 1.5-1 2.2-2 2.8-0.8 0.5-1.1 1-1.1 2v0.8" fill="none" stroke={fill} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={12} cy={17.8} r={1.5} fill={fill} />
        </G>
      );
      break;
  }
  return <G transform={`translate(${x - size / 2} ${y - size / 2}) scale(${k})`}>{content}</G>;
}

/** The emotion's icon in a small white badge, as shown in the session's top bar and in the journal. */
export function EmotionBadge({ id, size = 28 }: { id: EmotionId; size?: number }) {
  const r = size / 2;
  return (
    <View accessible={false} style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={r} cy={r} r={r - 1} fill={BADGE_FILL} stroke={EMOTIONS[id].color} strokeWidth={2} />
        <EmotionGlyph id={id} x={r} y={r} size={size * 0.68} />
      </Svg>
    </View>
  );
}

/** Badges stay white in dark mode too, like stickers, so the dark icon outlines stay visible. */
export const BADGE_FILL = '#FFFFFF';
