export type Point = { x: number; y: number };

/** Angle 0 is straight up, increasing clockwise. */
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path for a ring segment between two angles. */
export function ringSegment(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  startDeg: number,
  endDeg: number,
): string {
  const o0 = polar(cx, cy, outer, startDeg);
  const o1 = polar(cx, cy, outer, endDeg);
  const i1 = polar(cx, cy, inner, endDeg);
  const i0 = polar(cx, cy, inner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return [
    `M${f(o0.x)} ${f(o0.y)}`,
    `A${outer} ${outer} 0 ${large} 1 ${f(o1.x)} ${f(o1.y)}`,
    `L${f(i1.x)} ${f(i1.y)}`,
    `A${inner} ${inner} 0 ${large} 0 ${f(i0.x)} ${f(i0.y)}`,
    'Z',
  ].join(' ');
}
