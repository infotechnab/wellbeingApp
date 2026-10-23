import type { Sketch } from './model';

const sample = (id: string, strokes: number[][]): Sketch => ({
  id,
  width: 100,
  height: 100,
  createdAt: 0,
  strokes: strokes.map((points) => ({ tool: 'brush', points })),
});

const spiral = (() => {
  const points: number[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = i * 0.32;
    const r = 4 + i * 0.6;
    points.push(50 + r * Math.cos(a), 50 + r * Math.sin(a));
  }
  return points;
})();

const wave = (() => {
  const points: number[] = [];
  for (let x = 10; x <= 90; x += 4) points.push(x, 50 + 14 * Math.sin((x / 80) * Math.PI * 3));
  return points;
})();

/**
 * Example sketches shown on the sketch screen ("others drew…"). These are built in rather than
 * real users' drawings, so nobody's private sketch is ever shown to someone else.
 */
export const SAMPLE_SKETCHES: Sketch[] = [
  sample('sample-dot', [[50, 50]]),
  sample('sample-spiral', [spiral]),
  sample('sample-wave', [wave]),
  sample('sample-storm', [
    [20, 30, 35, 22, 50, 30, 65, 20, 80, 32],
    [30, 55, 45, 75, 52, 60, 68, 82],
  ]),
];
