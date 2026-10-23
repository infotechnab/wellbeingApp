import { View } from 'react-native';
import Svg from 'react-native-svg';

import type { Sketch } from '@/sketch/model';
import { radius, usePalette } from '@/theme';

import { SketchStrokes } from './sketch-strokes';

type Props = { sketch: Sketch; size: number };

export function SketchThumbnail({ sketch, size }: Props) {
  const palette = usePalette();
  const longest = Math.max(sketch.width, sketch.height, 1);
  // Thin lines vanish when a full-screen sketch is shrunk, so keep them readable.
  const scale = Math.max(1, (longest / size) * 0.6);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        overflow: 'hidden',
      }}>
      <Svg width={size} height={size} viewBox={`0 0 ${sketch.width} ${sketch.height}`} preserveAspectRatio="xMidYMid meet">
        <SketchStrokes strokes={sketch.strokes} ink={palette.text} paper={palette.surface} scale={scale} />
      </Svg>
    </View>
  );
}
