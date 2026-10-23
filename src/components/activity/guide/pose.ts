import { stepAt, type BubbleIcon, type PoseId, type Timeline } from '@/content';

export type HandShape = 'open' | 'fist' | 'palm' | 'point';

export type Hand = {
  x: number;
  y: number;
  shape: HandShape;
  /** Direction the fingers point, in degrees: 0 is up, 90 is right. Defaults to along the forearm. */
  angle?: number;
  /** Direction the elbow bends towards. */
  pole?: [number, number];
  /** A fixed elbow, for arms the automatic bend can't draw, like a hug. */
  elbow?: [number, number];
};

/** Arrows that show which way to move. */
export type HintKind = 'look' | 'shoulders-down' | 'press-down';

/**
 * Everything the guide figure can show, in the figure's 200 × 200 drawing space. "Left" and "right"
 * are the viewer's left and right, so the figure works like a mirror.
 */
export type FigureState = {
  /** Horizontal shift of the whole figure. */
  x: number;
  scale: number;
  /** Lean in degrees around the feet; positive leans to the right. */
  lean: number;
  /** How far the upper body sinks, e.g. when pressing the feet down. */
  crouch: number;
  /** 0 = breathed out, 1 = full breath in. */
  breath: number;
  /** Strength of the breathing circle behind the figure. */
  halo: number;
  /** Shoulder lift (negative drops them). */
  shoulders: number;
  /** -1 looks left, 1 looks right. */
  headTurn: number;
  /** -1 looks down, 1 looks up. */
  headUp: number;
  headTilt: number;
  /** 0 = closed, 1 = wide open. */
  eyes: number;
  /** Below 0 the brows draw together. */
  brow: number;
  /** -1 = frown, 1 = big smile. */
  smile: number;
  mouthOpen: number;
  left: Hand;
  right: Hand;
  /** Draw the left arm behind the body, for poses turned to the right. */
  leftBehind: number;
  liftLeft: number;
  liftRight: number;
  /** Feet pressing into the floor. */
  press: number;
  wall: number;
  cloud: number;
  phone: number;
  paper: number;
  /** Heart glowing on the chest. */
  heart: number;
  /** Little hearts floating up. */
  hearts: number;
  /** Breath puffs from the mouth. */
  puffs: number;
  /** Air drawn in through the nose. */
  sniff: number;
  sparkles: number;
  /** Small motion marks around the hands. */
  motion: number;
  /** Strength of the arrows named by `hintKind`. */
  hint: number;
  hintKind?: HintKind;
  bubble: number;
  bubbleIcon?: BubbleIcon;
  /** Animation clock in seconds, for twinkles and ripples. Stays at 0 when motion is reduced. */
  time: number;
  /** 0 to 1 through the current breath out, for the puffs. */
  puffPhase: number;
};

type Ctx = {
  /** 0 to 1 through the step. */
  p: number;
  /** Animation time in seconds. */
  t: number;
  /** Reduce motion: no looping movement. */
  still: boolean;
};

type Pose = (c: Ctx) => Partial<FigureState>;

type Point = { x: number; y: number };

const hand = (x: number, y: number, shape: HandShape = 'open', extra: Partial<Hand> = {}): Hand => ({ x, y, shape, ...extra });

const SIDE_LEFT = hand(57, 162);
const SIDE_RIGHT = hand(143, 162);
const BELLY_LEFT = hand(91, 152, 'open', { pole: [-1, 0.3] });
const BELLY_RIGHT = hand(109, 152, 'open', { pole: [1, 0.3] });
const HEART_HAND = hand(110, 130, 'palm', { angle: 50, pole: [-0.2, 1] });
const PHONE_LEFT = hand(94, 138, 'open', { pole: [-1, 0.7] });
const PHONE_RIGHT = hand(106, 138, 'open', { pole: [1, 0.7] });

export const BASE: FigureState = {
  x: 0,
  scale: 1,
  lean: 0,
  crouch: 0,
  breath: 0.3,
  halo: 0,
  shoulders: 0,
  headTurn: 0,
  headUp: 0,
  headTilt: 0,
  eyes: 1,
  brow: 0,
  smile: 0.35,
  mouthOpen: 0,
  left: SIDE_LEFT,
  right: SIDE_RIGHT,
  leftBehind: 0,
  liftLeft: 0,
  liftRight: 0,
  press: 0,
  wall: 0,
  cloud: 0,
  phone: 0,
  paper: 0,
  heart: 0,
  hearts: 0,
  puffs: 0,
  sniff: 0,
  sparkles: 0,
  motion: 0,
  hint: 0,
  bubble: 0,
  time: 0,
  puffPhase: 0,
};

export const UPPER_ARM = 26;
export const FOREARM = 24;

/** Where a shoulder sits; `side` is -1 for the left arm and 1 for the right. */
export function shoulderFor(s: Pick<FigureState, 'breath' | 'shoulders'>, side: -1 | 1): Point {
  return { x: 100 + side * (26 + 1.5 * s.breath), y: 118 - 3 * s.breath - s.shoulders };
}

/** Where the elbow goes: the pose's own, or a natural bend towards the hand's pole. */
export function elbowFor(s: Point, h: Hand, side: -1 | 1): Point {
  if (h.elbow) return { x: h.elbow[0], y: h.elbow[1] };
  const dx = h.x - s.x;
  const dy = h.y - s.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.001) return { x: s.x + side * UPPER_ARM, y: s.y };
  if (d >= UPPER_ARM + FOREARM) {
    // Out of reach: the arm goes straight (and stretches a little, cartoon style).
    const k = UPPER_ARM / (UPPER_ARM + FOREARM);
    return { x: s.x + dx * k, y: s.y + dy * k };
  }
  const a = Math.acos(Math.min(1, Math.max(-1, (UPPER_ARM ** 2 + d ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * d))));
  const base = Math.atan2(dy, dx);
  const e1 = { x: s.x + UPPER_ARM * Math.cos(base + a), y: s.y + UPPER_ARM * Math.sin(base + a) };
  const e2 = { x: s.x + UPPER_ARM * Math.cos(base - a), y: s.y + UPPER_ARM * Math.sin(base - a) };
  const [px, py] = h.pole ?? [side, 0.6];
  const mid = { x: (s.x + h.x) / 2, y: (s.y + h.y) / 2 };
  const score = (e: Point) => (e.x - mid.x) * px + (e.y - mid.y) * py;
  return score(e1) >= score(e2) ? e1 : e2;
}

/** Smooth 0 to 1. */
export const ease = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x * x * (3 - 2 * x);
};

const wave = (c: Ctx, period: number, phase = 0) => (c.still ? 0 : Math.sin(2 * Math.PI * (c.t / period + phase)));

/** A small fast shake for effort. */
const jitter = (c: Ctx, amount: number) => amount * wave(c, 0.11);

/** The guide is drawn around a pivot between the feet; leaning rotates around it. */
export const PIVOT = { x: 100, y: 178 };

/** Turn a point in the scene (like a spot on the wall) into the figure's own leaned coordinates. */
function toFigure(wx: number, wy: number, lean: number, shift: number) {
  const r = (-lean * Math.PI) / 180;
  const dx = wx - shift - PIVOT.x;
  const dy = wy - PIVOT.y;
  return { x: PIVOT.x + dx * Math.cos(r) - dy * Math.sin(r), y: PIVOT.y + dx * Math.sin(r) + dy * Math.cos(r) };
}

/** Where the wall's face is in the scene. */
export const WALL_X = 158;

function wallHands(lean: number, shift: number): Pick<FigureState, 'left' | 'right'> {
  const low = toFigure(WALL_X - 1, 125, lean, shift);
  const high = toFigure(WALL_X - 1, 101, lean, shift);
  return {
    left: hand(low.x, low.y, 'palm', { angle: -lean, pole: [0, 1] }),
    right: hand(high.x, high.y, 'palm', { angle: -lean, pole: [0.4, 1] }),
  };
}

const breatheIn: Pose = (c) => {
  const k = ease(c.p);
  return {
    breath: k,
    halo: 1,
    eyes: 0.75,
    shoulders: 2.5 * k,
    sniff: 1,
    left: hand(57 - 3 * k, 162 - 4 * k),
    right: hand(143 + 3 * k, 162 - 4 * k),
  };
};

const breatheOut: Pose = (c) => {
  const k = ease(c.p);
  return {
    breath: 1 - k,
    halo: 1,
    eyes: 0.65,
    shoulders: 2.5 * (1 - k),
    mouthOpen: 0.3,
    puffs: 1,
    puffPhase: c.p,
    left: hand(54 + 3 * k, 158 + 4 * k),
    right: hand(146 - 3 * k, 158 + 4 * k),
  };
};

function stepBack(c: Ctx, from: number, to: number): Partial<FigureState> {
  const walk = Math.min(1, c.p / 0.65);
  const n = from + (to - from) * ease(walk);
  const lift = c.still || walk >= 1 ? 0 : Math.sin(2 * Math.PI * walk);
  return {
    cloud: 1,
    x: 17 * n,
    scale: 1 - 0.065 * n,
    headTurn: -0.45,
    brow: n < 1.5 ? -0.3 : 0,
    smile: n < 1.5 ? 0 : 0.45,
    liftLeft: 3.5 * Math.max(0, lift),
    liftRight: 3.5 * Math.max(0, -lift),
  };
}

/** Arms crossed over the chest with each hand on the other shoulder; `s` pulls them in for a squeeze. */
const hugArms = (s: number): Pick<FigureState, 'left' | 'right'> => ({
  left: hand(121 - 2 * s, 121 + s, 'open', { elbow: [80 + 3 * s, 151] }),
  right: hand(79 + 2 * s, 121 + s, 'open', { elbow: [120 - 3 * s, 151] }),
});

/** Hands held loosely out at the sides, elbows down; `a` and `b` move each hand for a shake. */
const looseArms = (a = 0, b = 0): Pick<FigureState, 'left' | 'right'> => ({
  left: hand(47 + 0.3 * a, 150 + a, 'palm', { angle: 190, pole: [-0.3, 1] }),
  right: hand(153 + 0.3 * b, 150 + b, 'palm', { angle: 170, pole: [0.3, 1] }),
});

const phone: Pose = () => ({ phone: 1, left: PHONE_LEFT, right: PHONE_RIGHT, headUp: -0.6, eyes: 0.85, smile: 0.4 });

const softSmile: Pose = (c) => ({ smile: 0.85, eyes: 0.25, shoulders: -5, lean: 2 * wave(c, 6), sparkles: 0.3, left: hand(58, 167), right: hand(142, 167) });

export const POSES: Record<PoseId, Pose> = {
  stand: () => ({}),
  'breathe-in': breatheIn,
  'breathe-hold': () => ({ breath: 1, halo: 1, eyes: 0.7, shoulders: 2.5, left: hand(54, 158), right: hand(146, 158) }),
  'breathe-out': breatheOut,
  'belly-in': (c) => ({ ...breatheIn(c), eyes: 0.15, smile: 0.6, left: BELLY_LEFT, right: BELLY_RIGHT }),
  'belly-out': (c) => ({ ...breatheOut(c), eyes: 0.15, smile: 0.75, mouthOpen: 0, sparkles: 1, left: BELLY_LEFT, right: BELLY_RIGHT }),
  'heart-in': (c) => ({ ...breatheIn(c), eyes: 0.2, smile: 0.45, left: HEART_HAND, heart: 1 }),
  'heart-out': (c) => ({ ...breatheOut(c), eyes: 0.2, smile: 0.5, mouthOpen: 0.15, puffs: 0.6, left: HEART_HAND, heart: 1 }),
  'fists-tight': (c) => {
    const k = ease(c.p);
    const j = jitter(c, 0.9);
    return {
      breath: 0.3 + 0.5 * k,
      brow: -1,
      eyes: 0.4,
      smile: -0.35,
      motion: 0.4 + 0.6 * k,
      left: hand(84 + j, 131, 'fist', { pole: [-1, 0.8] }),
      right: hand(116 - j, 131, 'fist', { pole: [1, 0.8] }),
    };
  },
  'fists-open': (c) => {
    const k = ease(c.p);
    return {
      breath: 0.8 - 0.6 * k,
      eyes: 0.55,
      smile: 0.5,
      mouthOpen: 0.15,
      puffs: 0.5,
      puffPhase: c.p,
      left: hand(55, 160, 'palm', { angle: 200 }),
      right: hand(145, 160, 'palm', { angle: 160 }),
    };
  },
  'nose-in': (c) => {
    const k = ease(c.p);
    return {
      breath: k,
      halo: 1,
      eyes: 0.8,
      shoulders: 4 * k,
      headUp: 0.15 * k,
      sniff: 1.4,
      left: hand(57 - 4 * k, 162 - 6 * k),
      right: hand(143 + 4 * k, 162 - 6 * k),
    };
  },
  'blow-out': (c) => {
    const k = ease(Math.min(1, c.p * 1.6));
    return {
      breath: 1 - k,
      halo: 1,
      brow: -0.4,
      eyes: 0.55,
      mouthOpen: 1,
      puffs: 1.5,
      puffPhase: c.p,
      left: hand(53 + 4 * k, 156 + 6 * k, 'palm', { angle: 195 }),
      right: hand(147 - 4 * k, 156 + 6 * k, 'palm', { angle: 165 }),
    };
  },
  smile: () => ({ smile: 1, eyes: 0.25, sparkles: 0.6 }),
  'soft-shoulders': (c) => ({ ...softSmile(c), sparkles: 0, hint: 1, hintKind: 'shoulders-down' }),
  'soft-smile': softSmile,
  'soft-eyes': () => ({ eyes: 0.45, smile: 0.4 }),
  'soft-gaze': (c) => ({
    // A slow blink every few seconds.
    eyes: !c.still && c.t % 5 > 4.2 ? 0.1 : 0.35,
    smile: 0.45,
    halo: 0.5,
    breath: 0.35 + 0.15 * wave(c, 5),
  }),
  'eyes-closed': () => ({ eyes: 0.1, smile: 0.3 }),
  dream: (c) => ({ eyes: 0.1, smile: 0.5, lean: 2 * wave(c, 7), headTilt: 4 }),
  'dream-happy': (c) => ({ eyes: 0.1, smile: 0.95, sparkles: 1, lean: 2 * wave(c, 7), headTilt: 4 }),
  'look-left': (c) => ({ headTurn: -1, headUp: 0.1 * wave(c, 3), lean: -1.5, hint: 1, hintKind: 'look' }),
  'look-right': (c) => ({ headTurn: 1, headUp: 0.1 * wave(c, 3), lean: 1.5, hint: 1, hintKind: 'look' }),
  'look-up': (c) => ({ headUp: 1, headTurn: 0.35 * wave(c, 5), hint: 1, hintKind: 'look' }),
  'look-around': (c) => ({ headTurn: c.still ? 0.6 : wave(c, 6), headUp: 0.3 * wave(c, 3.7, 0.25), eyes: 0.95, hint: 1, hintKind: 'look' }),
  'feet-flat': () => ({ press: 0.3, headUp: -0.5, eyes: 0.8 }),
  'feet-press': (c) => {
    const j = jitter(c, 0.6);
    return {
      press: 1,
      crouch: 4,
      brow: -0.6,
      smile: -0.1,
      eyes: 0.5,
      headUp: -0.4,
      x: j * 0.4,
      hint: 1,
      hintKind: 'press-down',
      left: hand(58 + j, 160),
      right: hand(142 + j, 160),
    };
  },
  'hug-cross': () => ({
    eyes: 0.6,
    smile: 0.35,
    left: hand(124, 136, 'open', { elbow: [69, 147] }),
    right: hand(76, 136, 'open', { elbow: [131, 147] }),
  }),
  hug: () => ({ eyes: 0.4, smile: 0.45, headTilt: -4, ...hugArms(0) }),
  'hug-squeeze': (c) => {
    const s = c.still ? 0.5 : 0.5 + 0.5 * wave(c, 2.6);
    return { eyes: 0.1, smile: 0.6, headTilt: -5, breath: 0.25 - 0.1 * s, hearts: 0.6, ...hugArms(s) };
  },
  sway: (c) => ({ lean: 5 * wave(c, 4.4), eyes: 0.45, smile: 0.4 }),
  rock: (c) => ({ lean: 8 * wave(c, 5), eyes: 0.1, smile: 0.5, headTilt: 3 * wave(c, 5) }),
  'step-back-1': (c) => stepBack(c, 0, 1),
  'step-back-2': (c) => stepBack(c, 1, 2),
  'loose-hands': () => ({ eyes: 0.7, smile: 0.3, headUp: -0.2, ...looseArms() }),
  'shake-hands': (c) => ({ motion: 1, smile: 0.35, eyes: 0.8, ...looseArms(5 * wave(c, 0.22), 5 * wave(c, 0.22, 0.5)) }),
  'wall-ready': () => ({ wall: 1, leftBehind: 1, x: 6, lean: 4, headTurn: 0.7, eyes: 0.9, ...wallHands(4, 6) }),
  'wall-push': (c) => {
    const j = jitter(c, 0.7);
    return {
      wall: 1,
      leftBehind: 1,
      x: 6 + j * 0.3,
      lean: 10,
      crouch: 1.5,
      headTurn: 0.8,
      brow: -0.8,
      smile: -0.2,
      eyes: 0.45,
      motion: 0.8,
      ...wallHands(10, 6),
    };
  },
  'wall-release': () => ({ wall: 1, smile: 0.55, eyes: 0.3, sparkles: 0.4, headTurn: 0.2 }),
  // Chin on the right fist, the left arm across the body holding the right elbow.
  think: () => ({
    eyes: 0.55,
    headTilt: -6,
    headUp: 0.2,
    smile: 0.2,
    left: hand(112, 146, 'open', { elbow: [72, 149] }),
    right: hand(109, 98, 'fist', { elbow: [117, 140] }),
  }),
  boundary: () => ({ eyes: 0.85, smile: 0.15, headTurn: 0.15, right: hand(143, 96, 'palm', { angle: 0, pole: [1, 0.6] }) }),
  'hand-on-heart': () => ({ eyes: 0.3, smile: 0.45, heart: 1, left: HEART_HAND }),
  remember: (c) => ({ eyes: 0.1, smile: 0.65, heart: 0.7, lean: 1.5 * wave(c, 6), headTilt: 4, left: HEART_HAND }),
  appreciate: () => ({
    eyes: 0.2,
    smile: 0.85,
    heart: 0.8,
    hearts: 1,
    left: hand(96, 131, 'open', { pole: [-0.3, 1] }),
    right: hand(108, 129, 'open', { pole: [0.3, 1] }),
  }),
  point: () => ({ headTurn: 0.65, smile: 0.55, eyes: 0.9, right: hand(165, 101, 'point', { angle: 70 }) }),
  'one-finger': () => ({ eyes: 0.9, smile: 0.35, headTilt: 3, right: hand(137, 94, 'point', { angle: 0, pole: [1, 0.7] }) }),
  listen: () => ({ headTilt: 7, headTurn: -0.2, eyes: 0.4, smile: 0.3, right: hand(136, 78, 'open', { pole: [1, 0.5] }) }),
  touch: () => ({
    eyes: 0.3,
    smile: 0.35,
    headUp: -0.3,
    left: hand(50, 152, 'palm', { angle: 180, pole: [-0.3, 1] }),
    right: hand(150, 152, 'palm', { angle: 180, pole: [0.3, 1] }),
  }),
  phone,
  'phone-type': (c) => ({ ...phone(c), right: hand(106, 136 + 1.6 * Math.abs(wave(c, 0.5)), 'open', { pole: [1, 0.7] }) }),
  'phone-send': (c) => ({ ...phone(c), hearts: 1, headUp: -0.1, smile: 0.9, eyes: 0.3 }),
  write: (c) => ({
    paper: 1,
    headUp: -0.65,
    eyes: 0.8,
    smile: 0.3,
    left: hand(83, 150, 'open', { pole: [-1, 0.5] }),
    right: hand(103 + 5 * wave(c, 0.9), 138 + 1.5 * wave(c, 0.3), 'fist', { pole: [1, 0.8] }),
  }),
  // Arms up in a cheer.
  done: (c) => ({
    smile: 1,
    eyes: 0.2,
    sparkles: 1,
    breath: 0.45 + 0.1 * wave(c, 3),
    left: hand(52, 90, 'palm', { angle: -25, pole: [-1, 0.3] }),
    right: hand(148, 90, 'palm', { angle: 25, pole: [1, 0.3] }),
  }),
};

/** One pose at one moment, with the small signs of life every pose shares. */
export function poseState(pose: PoseId, c: Ctx, bubble?: BubbleIcon): FigureState {
  const partial = POSES[pose](c);
  const state: FigureState = { ...BASE, ...partial, bubble: bubble ? 1 : 0, bubbleIcon: bubble, time: c.still ? 0 : c.t };
  if (!c.still) {
    // Breathe gently and blink now and then, unless the pose says otherwise.
    if (partial.breath === undefined) state.breath = 0.3 + 0.1 * Math.sin((2 * Math.PI * c.t) / 4.5);
    if (state.eyes >= 0.5 && c.t % 4.2 > 4.05) state.eyes = 0.08;
  }
  return state;
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

function mixHand(a: FigureState, b: FigureState, side: -1 | 1, k: number): Hand {
  const ha = side < 0 ? a.left : a.right;
  const hb = side < 0 ? b.left : b.right;
  const poleA = ha.pole ?? [0, 0];
  const poleB = hb.pole ?? [0, 0];
  let elbow: [number, number] | undefined;
  if (ha.elbow || hb.elbow) {
    // A fixed elbow on either side: blend between where each pose puts the elbow.
    const ea = elbowFor(shoulderFor(a, side), ha, side);
    const eb = elbowFor(shoulderFor(b, side), hb, side);
    elbow = [mix(ea.x, eb.x, k), mix(ea.y, eb.y, k)];
  }
  return {
    x: mix(ha.x, hb.x, k),
    y: mix(ha.y, hb.y, k),
    shape: k < 0.5 ? ha.shape : hb.shape,
    angle: ha.angle !== undefined && hb.angle !== undefined ? mix(ha.angle, hb.angle, k) : k < 0.5 ? ha.angle : hb.angle,
    pole: ha.pole || hb.pole ? [mix(poleA[0], poleB[0], k), mix(poleA[1], poleB[1], k)] : undefined,
    elbow,
  };
}

const NUMBERS = Object.keys(BASE).filter((key) => typeof BASE[key as keyof FigureState] === 'number') as (keyof FigureState)[];

/** Fade one picture out and the next in, so a bubble or arrow never jumps to a new picture. */
function crossFade<V>(a: number, av: V | undefined, b: number, bv: V | undefined, k: number): [number, V | undefined] {
  if (av === bv) return [mix(a, b, k), bv];
  return k < 0.5 ? [a * (1 - 2 * k), av] : [b * (2 * k - 1), bv];
}

/** Blend two states; `k` runs from 0 (all `a`) to 1 (all `b`). */
export function mixStates(a: FigureState, b: FigureState, k: number): FigureState {
  const out = { ...b, left: mixHand(a, b, -1, k), right: mixHand(a, b, 1, k) } as FigureState;
  for (const key of NUMBERS) {
    if (key === 'time' || key === 'puffPhase') continue;
    (out as Record<string, unknown>)[key] = mix(a[key] as number, b[key] as number, k);
  }
  out.leftBehind = k < 0.5 ? a.leftBehind : b.leftBehind;
  [out.bubble, out.bubbleIcon] = crossFade(a.bubble, a.bubble > 0 ? a.bubbleIcon : undefined, b.bubble, b.bubble > 0 ? b.bubbleIcon : undefined, k);
  [out.hint, out.hintKind] = crossFade(a.hint, a.hint > 0 ? a.hintKind : undefined, b.hint, b.hint > 0 ? b.hintKind : undefined, k);
  return out;
}

const BLEND_SECONDS = 0.9;

/**
 * The figure `t` seconds into a timeline. Each step eases in from where the previous one ended; a
 * looping preview eases from its last step back to its first.
 */
export function figureAt(timeline: Timeline, t: number, options: { still?: boolean; loop?: boolean } = {}): FigureState {
  const still = options.still ?? false;
  const { index, step, progress } = stepAt(timeline, t);
  const current = poseState(step.pose, { p: still ? 0.5 : progress, t, still }, step.bubble);
  if (still) return current;

  const blend = Math.min(BLEND_SECONDS, step.seconds * 0.35);
  const into = t - step.start;
  if (into >= blend) return current;

  const previous = index > 0 ? timeline.steps[index - 1] : options.loop ? timeline.steps[timeline.steps.length - 1] : undefined;
  const from = previous ? poseState(previous.pose, { p: 1, t, still }, previous.bubble) : poseState('stand', { p: 1, t, still });
  return mixStates(from, current, ease(into / blend));
}
