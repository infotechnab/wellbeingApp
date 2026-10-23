import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { BubbleIcon } from '@/content';

import { elbowFor, PIVOT, shoulderFor, WALL_X, type FigureState, type Hand } from './pose';

export type FigureColors = {
  /** The emotion's colour, for the body. */
  body: string;
  /** Outlines and face. */
  ink: string;
  /** Marks drawn on the background: shadow, puffs, ripples, motion lines. */
  mark: string;
  /** Thought bubble fill. */
  bubble: string;
  /** Icons inside the bubble. */
  icon: string;
  wall: string;
  cloud: string;
  success: string;
  /** Arrows that show which way to move. */
  accent: string;
};

const HEART_RED = '#E8746A';
const GOLD = '#F2C14E';
const CHEEK = '#F4A6A0';

type Point = { x: number; y: number };

const n = (v: number) => Math.round(v * 10) / 10;

/** A soft "rubber hose" curve through the elbow. */
function armPath(s: Point, e: Point, h: Point) {
  const cx = 2 * e.x - (s.x + h.x) / 2;
  const cy = 2 * e.y - (s.y + h.y) / 2;
  return `M${n(s.x)} ${n(s.y)} Q${n(cx)} ${n(cy)} ${n(h.x)} ${n(h.y)}`;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** A line or curve with an arrowhead on its end; `dir` is the way the head points. */
function arrowPath(line: string, tip: Point, dir: Point, head = 5.5) {
  const len = Math.hypot(dir.x, dir.y) || 1;
  const bx = -dir.x / len;
  const by = -dir.y / len;
  const wing = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${n(tip.x + head * (bx * Math.cos(a) - by * Math.sin(a)))} ${n(tip.y + head * (bx * Math.sin(a) + by * Math.cos(a)))}`;
  };
  return `${line} M${wing(35)} L${n(tip.x)} ${n(tip.y)} L${wing(-35)}`;
}

function heartPath(cx: number, cy: number, size: number) {
  const s = size / 10;
  const p = (x: number, y: number) => `${n(cx + x * s)} ${n(cy + y * s)}`;
  return `M${p(0, 4)} C${p(-9, -2)} ${p(-5, -10)} ${p(0, -5)} C${p(5, -10)} ${p(9, -2)} ${p(0, 4)} Z`;
}

function starPath(cx: number, cy: number, outer: number, inner: number, points = 5) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    d += `${i === 0 ? 'M' : 'L'}${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

function Arm({ shoulder, hand, side, colors }: { shoulder: Point; hand: Hand; side: -1 | 1; colors: FigureColors }) {
  const elbow = elbowFor(shoulder, hand, side);
  const d = armPath(shoulder, elbow, hand);
  const forearm = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
  // Fingers point along the forearm unless the pose says otherwise (0 = up, 90 = right).
  const angle = hand.angle ?? (forearm * 180) / Math.PI + 90;
  const rad = ((angle - 90) * Math.PI) / 180;
  const finger = (spread: number, length: number) => {
    const a = rad + (spread * Math.PI) / 180;
    return `M${n(hand.x)} ${n(hand.y)} L${n(hand.x + length * Math.cos(a))} ${n(hand.y + length * Math.sin(a))}`;
  };
  const fingers =
    hand.shape === 'palm' ? [finger(-34, 11), finger(-12, 12.5), finger(10, 12.5), finger(32, 11)] : hand.shape === 'point' ? [finger(0, 13)] : [];

  return (
    <G>
      <Path d={d} stroke={colors.ink} strokeWidth={10.5} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={colors.body} strokeWidth={7} strokeLinecap="round" fill="none" />
      {fingers.map((f) => (
        <Path key={`o${f}`} d={f} stroke={colors.ink} strokeWidth={5.2} strokeLinecap="round" />
      ))}
      {fingers.map((f) => (
        <Path key={`f${f}`} d={f} stroke={colors.body} strokeWidth={2.6} strokeLinecap="round" />
      ))}
      <Circle cx={n(hand.x)} cy={n(hand.y)} r={hand.shape === 'fist' ? 6.4 : 7} fill={colors.body} stroke={colors.ink} strokeWidth={2} />
      {hand.shape === 'fist' ? (
        <Path
          d={`M${n(hand.x - 3.5)} ${n(hand.y - 1)} Q${n(hand.x)} ${n(hand.y + 2.5)} ${n(hand.x + 3.5)} ${n(hand.y - 1)}`}
          stroke={colors.ink}
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </G>
  );
}

/** Arrows for the current hint, like which way to turn the head. */
function Hints({ s, head, colors }: { s: FigureState; head: Point; colors: FigureColors }) {
  // A thought bubble already says what to do, so the arrows step aside for it.
  const strength = s.hint * (1 - s.bubble);
  if (strength <= 0.01 || !s.hintKind) return null;
  const nudge = 1.6 * (0.5 + 0.5 * Math.sin(s.time * 4));
  const arrows: { d: string; opacity: number; shift: Point }[] = [];
  switch (s.hintKind) {
    case 'look': {
      // An arc over the head towards the side the figure is turning to, or an arrow up.
      const arc = (side: -1 | 1) => {
        const ctrl = { x: head.x + side * 14, y: head.y - 52 };
        const tip = { x: head.x + side * 34, y: head.y - 34 };
        return arrowPath(`M${n(head.x - side * 8)} ${n(head.y - 40)} Q${n(ctrl.x)} ${n(ctrl.y)} ${n(tip.x)} ${n(tip.y)}`, tip, { x: tip.x - ctrl.x, y: tip.y - ctrl.y });
      };
      const top = { x: head.x, y: head.y - 58 };
      arrows.push(
        { d: arc(-1), opacity: clamp01((-s.headTurn - 0.3) / 0.5), shift: { x: -nudge, y: 0 } },
        { d: arc(1), opacity: clamp01((s.headTurn - 0.3) / 0.5), shift: { x: nudge, y: 0 } },
        {
          d: arrowPath(`M${n(head.x)} ${n(head.y - 39)} L${n(top.x)} ${n(top.y)}`, top, { x: 0, y: -1 }),
          opacity: clamp01((s.headUp - 0.3) / 0.5),
          shift: { x: 0, y: -nudge },
        },
      );
      break;
    }
    case 'shoulders-down':
      for (const x of [50, 150]) arrows.push({ d: arrowPath(`M${x} 94 L${x} 112`, { x, y: 112 }, { x: 0, y: 1 }), opacity: 1, shift: { x: 0, y: nudge } });
      break;
    case 'press-down':
      for (const x of [87, 113]) arrows.push({ d: arrowPath(`M${x} 140 L${x} 163`, { x, y: 163 }, { x: 0, y: 1 }, 6.5), opacity: 1, shift: { x: 0, y: nudge } });
      break;
  }
  return (
    <G>
      {arrows.map((a, i) =>
        a.opacity > 0.01 ? (
          <Path
            key={i}
            d={a.d}
            transform={`translate(${n(a.shift.x)} ${n(a.shift.y)})`}
            stroke={colors.accent}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={strength * a.opacity}
          />
        ) : null,
      )}
    </G>
  );
}

function Bubble({ icon, time, colors }: { icon?: BubbleIcon; time: number; colors: FigureColors }) {
  const cx = 148;
  const cy = 40;
  const ink = colors.icon;
  let content = null;
  switch (icon) {
    case 'words':
      content = [0, 1, 2].map((k) => {
        const bounce = Math.max(0, Math.sin(2 * Math.PI * (time / 1.1 - k * 0.18)));
        return <Circle key={k} cx={cx - 8 + 8 * k} cy={n(cy - 2.6 * bounce)} r={2.6} fill={ink} />;
      });
      break;
    case 'heart':
      content = <Path d={heartPath(cx, cy + 1, 13 + 0.8 * Math.sin(time * 4))} fill={HEART_RED} />;
      break;
    case 'star':
      content = <Path d={starPath(cx, cy, 10, 4.4)} fill={GOLD} />;
      break;
    case 'check':
      content = <Path d={`M${cx - 9} ${cy + 1} L${cx - 2.5} ${cy + 7} L${cx + 9} ${cy - 6}`} stroke={colors.success} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      break;
    case 'people':
      // One person in front of another, different sizes, so the pair can't read as a face.
      content = (
        <G>
          <G opacity={0.45}>
            <Circle cx={cx + 6} cy={cy - 6.5} r={3.6} fill={ink} />
            <Path d={`M${cx - 1} ${cy + 8} Q${cx - 1} ${cy - 1.5} ${cx + 6} ${cy - 1.5} Q${cx + 13} ${cy - 1.5} ${cx + 13} ${cy + 8} Z`} fill={ink} />
          </G>
          <Circle cx={cx - 4} cy={cy - 3.5} r={4.4} fill={ink} stroke={colors.bubble} strokeWidth={1.2} />
          <Path
            d={`M${cx - 13} ${cy + 11} Q${cx - 13} ${cy + 2} ${cx - 4} ${cy + 2} Q${cx + 5} ${cy + 2} ${cx + 5} ${cy + 11} Z`}
            fill={ink}
            stroke={colors.bubble}
            strokeWidth={1.2}
          />
        </G>
      );
      break;
    case 'question':
      content = (
        <G>
          <Path
            d={`M${cx - 5} ${cy - 5.5} Q${cx - 5} ${cy - 11} ${cx} ${cy - 11} Q${cx + 5.5} ${cy - 11} ${cx + 5.5} ${cy - 6} Q${cx + 5.5} ${cy - 2.5} ${cx + 1} ${cy - 0.5} Q${cx} ${cy} ${cx} ${cy + 2.5}`}
            stroke={ink}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={cx} cy={cy + 7.5} r={1.8} fill={ink} />
        </G>
      );
      break;
    case 'one':
      content = <Path d={`M${cx - 4} ${cy - 6} L${cx + 1} ${cy - 10} L${cx + 1} ${cy + 10} M${cx - 4} ${cy + 10} L${cx + 6} ${cy + 10}`} stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      break;
    case 'eye':
      content = (
        <G>
          <Path d={`M${cx - 12} ${cy} Q${cx} ${cy - 10} ${cx + 12} ${cy} Q${cx} ${cy + 10} ${cx - 12} ${cy} Z`} stroke={ink} strokeWidth={2} fill="none" />
          <Circle cx={cx} cy={cy} r={3.8} fill={ink} />
        </G>
      );
      break;
    case 'hand':
      content = (
        <G>
          {[-6, -2, 2, 6].map((dx, k) => (
            <Path key={dx} d={`M${cx + dx} ${cy + 2} L${cx + dx * 1.15} ${cy - (k === 0 || k === 3 ? 7 : 9.5)}`} stroke={ink} strokeWidth={3} strokeLinecap="round" />
          ))}
          <Circle cx={cx} cy={cy + 4} r={6.2} fill={ink} />
        </G>
      );
      break;
    case 'ear':
      content = (
        <G>
          <Path d={`M${cx - 4} ${cy - 8} Q${cx + 8} ${cy - 10} ${cx + 7} ${cy + 1} Q${cx + 6} ${cy + 7} ${cx + 1} ${cy + 9} Q${cx - 2} ${cy + 10} ${cx - 2} ${cy + 7}`} stroke={ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <Path d={`M${cx} ${cy - 3} Q${cx + 4} ${cy - 3} ${cx + 3} ${cy + 1}`} stroke={ink} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d={`M${cx - 10} ${cy - 5} Q${cx - 13} ${cy} ${cx - 10} ${cy + 5}`} stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.6 + 0.4 * Math.sin(time * 5)} />
        </G>
      );
      break;
  }
  return (
    <G>
      <Circle cx={130} cy={70} r={2.3} fill={colors.bubble} stroke={colors.mark} strokeWidth={1.6} />
      <Circle cx={136} cy={61} r={3.6} fill={colors.bubble} stroke={colors.mark} strokeWidth={1.8} />
      <Ellipse cx={cx} cy={cy} rx={22} ry={17} fill={colors.bubble} stroke={colors.mark} strokeWidth={2} />
      {content}
    </G>
  );
}

/** The animated guide: a friendly figure that shows the current step, drawn from a `FigureState`. */
export function GuideFigure({ state: s, colors, size }: { state: FigureState; colors: FigureColors; size: number }) {
  const ink = colors.ink;
  const breath = s.breath;
  const leftShoulder = shoulderFor(s, -1);
  const rightShoulder = shoulderFor(s, 1);
  const headX = 100 + 2 * s.headTurn;
  const headY = 74 - 2.5 * breath;
  const faceX = headX + 9 * s.headTurn;
  const faceY = headY - 5 * s.headUp;
  const mouth = { x: faceX, y: faceY + 15 };
  const figure = `translate(${n(s.x)} 0) translate(${PIVOT.x} ${PIVOT.y}) scale(${n(s.scale * 100) / 100}) rotate(${n(s.lean)}) translate(${-PIVOT.x} ${-PIVOT.y})`;

  const eye = (ex: number, inner: 1 | -1) => {
    const ey = faceY - 2;
    return (
      <G key={ex}>
        {s.eyes >= 0.32 ? (
          <>
            <Ellipse cx={n(ex)} cy={n(ey)} rx={3.3} ry={n(0.9 + 3.4 * Math.min(1, s.eyes))} fill={ink} />
            {s.eyes > 0.7 ? <Circle cx={n(ex + 1)} cy={n(ey - 1.3)} r={0.9} fill="#FFFFFF" /> : null}
          </>
        ) : (
          <Path d={`M${n(ex - 4)} ${n(ey)} Q${n(ex)} ${n(ey + 3.2)} ${n(ex + 4)} ${n(ey)}`} stroke={ink} strokeWidth={2} strokeLinecap="round" fill="none" />
        )}
        {s.brow < -0.05 ? (
          <Path
            d={`M${n(ex - 4.5)} ${n(ey - 7.5 + (inner < 0 ? 2.6 * -s.brow : 0))} L${n(ex + 4.5)} ${n(ey - 7.5 + (inner > 0 ? 2.6 * -s.brow : 0))}`}
            stroke={ink}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={Math.min(1, -s.brow)}
          />
        ) : null}
      </G>
    );
  };

  const leftArm = <Arm shoulder={leftShoulder} hand={s.left} side={-1} colors={colors} />;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Ellipse cx={n(100 + s.x)} cy={179} rx={n(40 * s.scale)} ry={5.5} fill={colors.mark} opacity={0.14} />

      {s.wall > 0.01 ? (
        <G opacity={s.wall}>
          <Rect x={WALL_X} y={36} width={40} height={146} fill={colors.wall} />
          {[52, 68, 84, 100, 116, 132, 148, 164].map((y, i) => (
            <G key={y}>
              <Path d={`M${WALL_X} ${y} H200`} stroke={colors.mark} strokeWidth={1.2} opacity={0.35} />
              <Path d={`M${WALL_X + (i % 2 ? 10 : 24)} ${y} V${y + 16}`} stroke={colors.mark} strokeWidth={1.2} opacity={0.35} />
            </G>
          ))}
          <Path d={`M${WALL_X} 36 V182`} stroke={colors.mark} strokeWidth={2} opacity={0.7} />
        </G>
      ) : null}

      {s.cloud > 0.01 ? (
        <G opacity={s.cloud} transform={`translate(${n(Math.sin(s.time * 7) * 0.8)} 0)`}>
          <Path d="M20 128 Q14 112 28 108 Q32 94 46 98 Q58 96 60 110 Q70 116 62 128 Z" fill={colors.cloud} />
          <Circle cx={34} cy={114} r={1.8} fill={ink} />
          <Circle cx={46} cy={114} r={1.8} fill={ink} />
          <Path d="M32 121 Q35 118 38 121 Q41 124 44 121 Q47 118 50 121" stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M30 92 Q27 86 31 82 M42 90 Q39 84 43 80 M54 92 Q51 86 55 82" stroke={colors.mark} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.5} />
        </G>
      ) : null}

      {s.press > 0.01
        ? [0, 1].map((k) => {
            const q = (s.time * 0.9 + k / 2) % 1;
            return (
              <G key={k} opacity={s.press * (1 - q) * 0.9}>
                <Ellipse cx={n(88 + s.x)} cy={179} rx={n(12 + 10 * q)} ry={n(3 + 2 * q)} stroke={colors.mark} strokeWidth={2} fill="none" />
                <Ellipse cx={n(112 + s.x)} cy={179} rx={n(12 + 10 * q)} ry={n(3 + 2 * q)} stroke={colors.mark} strokeWidth={2} fill="none" />
              </G>
            );
          })
        : null}

      <G transform={figure}>
        {s.halo > 0.01 ? (
          <G opacity={s.halo}>
            <Circle cx={100} cy={116} r={n(50 + 20 * breath)} fill={colors.body} opacity={0.25} />
            <Circle cx={100} cy={116} r={n(50 + 20 * breath)} stroke={colors.body} strokeWidth={2.5} fill="none" opacity={0.7} />
          </G>
        ) : null}

        <Ellipse cx={88} cy={n(175 - s.liftLeft)} rx={n(11 + 2 * s.press)} ry={n(5.6 - 1.6 * s.press)} fill={colors.body} stroke={ink} strokeWidth={2} />
        <Ellipse cx={112} cy={n(175 - s.liftRight)} rx={n(11 + 2 * s.press)} ry={n(5.6 - 1.6 * s.press)} fill={colors.body} stroke={ink} strokeWidth={2} />

        <G transform={`translate(0 ${n(s.crouch)})`}>
          {s.leftBehind >= 0.5 ? leftArm : null}

          <G transform={`translate(100 172) scale(${n(100 + 5 * breath) / 100} ${n(100 + 4.5 * breath) / 100}) translate(-100 -172)`}>
            <Path
              d="M74 116 Q100 102 126 116 Q136 121 137 134 L139 160 Q140 172 127 172 L73 172 Q60 172 61 160 L63 134 Q64 121 74 116 Z"
              fill={colors.body}
              stroke={ink}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </G>

          {s.heart > 0.01 ? (
            <Path d={heartPath(112, 128, 9 + 2.5 * breath + 0.8 * Math.sin(s.time * 5))} fill={HEART_RED} opacity={s.heart} />
          ) : null}

          <G transform={`rotate(${n(s.headTilt)} ${n(headX)} ${n(headY + 30)})`}>
            <Circle cx={n(headX)} cy={n(headY)} r={31} fill={colors.body} stroke={ink} strokeWidth={2.2} />
            <Circle cx={n(faceX - 18)} cy={n(faceY + 9)} r={4.6} fill={CHEEK} opacity={0.55} />
            <Circle cx={n(faceX + 18)} cy={n(faceY + 9)} r={4.6} fill={CHEEK} opacity={0.55} />
            {eye(faceX - 11, 1)}
            {eye(faceX + 11, -1)}
            {s.mouthOpen > 0.12 ? (
              <Ellipse cx={n(mouth.x)} cy={n(mouth.y + 1)} rx={n(2.6 + 2.4 * s.mouthOpen)} ry={n(3 + 3.2 * s.mouthOpen)} fill={ink} />
            ) : (
              <Path
                d={`M${n(mouth.x - 7)} ${n(mouth.y)} Q${n(mouth.x)} ${n(mouth.y + 7 * s.smile)} ${n(mouth.x + 7)} ${n(mouth.y)}`}
                stroke={ink}
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>

          {s.phone > 0.01 ? (
            <G opacity={s.phone}>
              <Rect x={92} y={116} width={16} height={25} rx={3} fill={ink} />
              <Rect x={94.5} y={119} width={11} height={17} rx={1.5} fill="#9FD1F0" />
            </G>
          ) : null}
          {s.paper > 0.01 ? (
            <G opacity={s.paper}>
              <Rect x={78} y={120} width={30} height={34} rx={2} fill="#FFFFFF" stroke={ink} strokeWidth={1.6} />
              {[129, 136, 143].map((y) => (
                <Path key={y} d={`M83 ${y} H${y === 143 ? 95 : 103}`} stroke={ink} strokeWidth={1.2} opacity={0.35} />
              ))}
            </G>
          ) : null}

          {s.leftBehind < 0.5 ? leftArm : null}
          <Arm shoulder={rightShoulder} hand={s.right} side={1} colors={colors} />

          {s.paper > 0.01 ? (
            <G opacity={s.paper}>
              <Path d={`M${n(s.right.x + 2)} ${n(s.right.y - 3)} L${n(s.right.x - 8)} ${n(s.right.y + 9)}`} stroke={ink} strokeWidth={5} strokeLinecap="round" />
              <Path d={`M${n(s.right.x + 2)} ${n(s.right.y - 3)} L${n(s.right.x - 7)} ${n(s.right.y + 8)}`} stroke={GOLD} strokeWidth={2.8} strokeLinecap="round" />
            </G>
          ) : null}

          {s.motion > 0.01
            ? [s.left, s.right].map((h, i) => (
                <Path
                  key={i}
                  d={`M${n(h.x - 12)} ${n(h.y - 5)} Q${n(h.x - 15)} ${n(h.y)} ${n(h.x - 12)} ${n(h.y + 5)} M${n(h.x + 12)} ${n(h.y - 5)} Q${n(h.x + 15)} ${n(h.y)} ${n(h.x + 12)} ${n(h.y + 5)}`}
                  stroke={colors.mark}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  fill="none"
                  opacity={s.motion * (0.45 + 0.55 * Math.abs(Math.sin(s.time * 9 + i)))}
                />
              ))
            : null}

          {s.puffs > 0.01
            ? [0, 1, 2].map((k) => {
                const q = Math.min(1, Math.max(0, s.puffPhase * 1.3 - k * 0.18));
                if (q <= 0) return null;
                const size = 3.5 * Math.min(1.6, s.puffs);
                const px = mouth.x + 9 + 26 * q * Math.min(1.4, s.puffs);
                const py = mouth.y + 2 + 7 * q * (k - 1);
                return (
                  <Path
                    key={k}
                    d={`M${n(px)} ${n(py)} q${n(size)} ${n(-size)} ${n(size * 2)} 0 q${n(size)} ${n(size)} ${n(size * 2)} 0`}
                    stroke={colors.mark}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    fill="none"
                    opacity={Math.min(1, s.puffs) * (1 - q) * 0.9}
                  />
                );
              })
            : null}

          {s.sniff > 0.01
            ? [0, 1, 2].map((k) => {
                // Little arrowheads drifting in towards the face: air coming in.
                const q = (s.time / 1.3 + k / 3) % 1;
                const x = faceX + 54 - 20 * q;
                const y = faceY + 8 + 8 * (k - 1) * (1 - 0.5 * q);
                const w = 3 + 1.2 * Math.min(1.5, s.sniff);
                return (
                  <Path
                    key={`in${k}`}
                    d={`M${n(x + w)} ${n(y - w)} L${n(x)} ${n(y)} L${n(x + w)} ${n(y + w)}`}
                    stroke={colors.mark}
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={Math.min(1, s.sniff) * Math.sin(Math.PI * q) * 0.9}
                  />
                );
              })
            : null}

          <Hints s={s} head={{ x: headX, y: headY }} colors={colors} />
        </G>

        {s.hearts > 0.01
          ? [0, 1, 2].map((k) => {
              const q = (s.time / 2.6 + k / 3) % 1;
              return (
                <Path
                  key={k}
                  d={heartPath(110 + 24 * q + 3 * Math.sin(q * 9), 120 - 66 * q, 6 + 4 * q)}
                  fill={HEART_RED}
                  opacity={s.hearts * Math.sin(Math.PI * q)}
                />
              );
            })
          : null}

        {s.sparkles > 0.01
          ? [
              [52, 62],
              [152, 94],
              [56, 132],
              [146, 46],
            ].map(([x, y], k) => {
              const tw = 0.5 + 0.5 * Math.sin(2 * Math.PI * (s.time / 1.7 + k * 0.27));
              return <Path key={k} d={starPath(x, y, 3 + 3 * tw, 1.2 + tw * 0.6, 4)} fill={GOLD} opacity={s.sparkles * (0.35 + 0.65 * tw)} />;
            })
          : null}
      </G>

      {s.bubble > 0.01 ? (
        <G opacity={s.bubble}>
          <Bubble icon={s.bubbleIcon} time={s.time} colors={colors} />
        </G>
      ) : null}
    </Svg>
  );
}
