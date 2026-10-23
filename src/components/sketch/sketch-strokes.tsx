import { Circle, G, Path } from 'react-native-svg';

import { BRUSH_WIDTH, ERASER_WIDTH, isDot, strokeToPath, type Stroke } from '@/sketch/model';

type Props = {
  strokes: Stroke[];
  ink: string;
  paper: string;
  /** Multiplier for line widths when a sketch is drawn smaller or larger than it was made. */
  scale?: number;
};

/** Renders strokes; the eraser paints with the paper colour. */
export function SketchStrokes({ strokes, ink, paper, scale = 1 }: Props) {
  return (
    <G>
      {strokes.map((stroke, i) => {
        const color = stroke.tool === 'eraser' ? paper : ink;
        const width = (stroke.tool === 'eraser' ? ERASER_WIDTH : BRUSH_WIDTH) * scale;
        if (isDot(stroke)) {
          return <Circle key={i} cx={stroke.points[0]} cy={stroke.points[1]} r={width / 2} fill={color} />;
        }
        return (
          <Path
            key={i}
            d={strokeToPath(stroke.points)}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}
    </G>
  );
}
