export type SketchTool = 'brush' | 'eraser';

export type Stroke = {
  tool: SketchTool;
  /** Flat list of x, y pairs in canvas coordinates. */
  points: number[];
};

export type Sketch = {
  id: string;
  width: number;
  height: number;
  strokes: Stroke[];
  createdAt: number;
  syncedAt?: number;
};

export const BRUSH_WIDTH = 6;
export const ERASER_WIDTH = 28;

const round = (n: number) => Math.round(n * 10) / 10;

/** Smooth SVG path through the stroke's points (quadratic curves through midpoints). */
export function strokeToPath(points: number[]): string {
  if (points.length < 2) return '';
  const [x0, y0] = points;
  if (points.length === 2) return `M${round(x0)} ${round(y0)}`;
  let d = `M${round(x0)} ${round(y0)}`;
  for (let i = 2; i < points.length - 2; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    const mx = (x + points[i + 2]) / 2;
    const my = (y + points[i + 3]) / 2;
    d += ` Q${round(x)} ${round(y)} ${round(mx)} ${round(my)}`;
  }
  d += ` L${round(points[points.length - 2])} ${round(points[points.length - 1])}`;
  return d;
}

/** A stroke made of a single touch is drawn as a dot. */
export function isDot(stroke: Stroke): boolean {
  if (stroke.points.length <= 2) return true;
  const [x0, y0] = stroke.points;
  return stroke.points.every((value, i) => Math.abs(value - (i % 2 === 0 ? x0 : y0)) < 2);
}

/** Skips points closer than `minDistance` to the previous one, to keep saved sketches small. */
export function appendPoint(points: number[], x: number, y: number, minDistance = 2): number[] {
  const n = points.length;
  if (n >= 2) {
    const dx = x - points[n - 2];
    const dy = y - points[n - 1];
    if (dx * dx + dy * dy < minDistance * minDistance) return points;
  }
  return [...points, x, y];
}
