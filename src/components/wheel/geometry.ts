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

/**
 * SVG path for a soft petal: a ring segment with rounded corners and straight sides that stay
 * `gap` apart from the neighbouring petal all the way out.
 */
export function petalPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  startDeg: number,
  endDeg: number,
  gap: number,
  outerCorner: number,
  innerCorner: number,
): string {
  const half = gap / 2;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  // A side runs parallel to the dividing radius, `half` inside the petal; at radius r it sits this
  // many degrees in from the dividing angle.
  const inset = (r: number) => toDeg(Math.asin(Math.min(1, half / r)));
  const p = (r: number, deg: number) => polar(cx, cy, r, deg);
  const f = (pt: Point) => `${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;

  const outerStart = startDeg + inset(outer);
  const outerEnd = endDeg - inset(outer);
  const innerStart = startDeg + inset(inner);
  const innerEnd = endDeg - inset(inner);
  const oc = toDeg(outerCorner / outer);
  const ic = toDeg(innerCorner / inner);

  return [
    `M${f(p(outer, outerStart + oc))}`,
    `A${outer} ${outer} 0 0 1 ${f(p(outer, outerEnd - oc))}`,
    `Q${f(p(outer, outerEnd))} ${f(p(outer - outerCorner, endDeg - inset(outer - outerCorner)))}`,
    `L${f(p(inner + innerCorner, endDeg - inset(inner + innerCorner)))}`,
    `Q${f(p(inner, innerEnd))} ${f(p(inner, innerEnd - ic))}`,
    `A${inner} ${inner} 0 0 0 ${f(p(inner, innerStart + ic))}`,
    `Q${f(p(inner, innerStart))} ${f(p(inner + innerCorner, startDeg + inset(inner + innerCorner)))}`,
    `L${f(p(outer - outerCorner, startDeg + inset(outer - outerCorner)))}`,
    `Q${f(p(outer, outerStart))} ${f(p(outer, outerStart + oc))}`,
    'Z',
  ].join(' ');
}
