import { useEffect, useState } from 'react';

/** Current time in ms, refreshed on animation frames (at most `fps` times a second) while `active`. */
export function useFrameClock(active: boolean, fps = 30): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (ts - last >= 1000 / fps - 1) {
        last = ts;
        setNow(Date.now());
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, fps]);

  return now;
}
