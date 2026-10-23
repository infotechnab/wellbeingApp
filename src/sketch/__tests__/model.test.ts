import { appendPoint, isDot, strokeToPath } from '../model';

describe('sketch model', () => {
  it('treats a single touch as a dot', () => {
    expect(isDot({ tool: 'brush', points: [10, 10] })).toBe(true);
    expect(isDot({ tool: 'brush', points: [10, 10, 11, 10.5] })).toBe(true);
    expect(isDot({ tool: 'brush', points: [10, 10, 40, 40] })).toBe(false);
  });

  it('drops points that are too close together', () => {
    let points = appendPoint([], 0, 0);
    points = appendPoint(points, 1, 1);
    points = appendPoint(points, 5, 5);
    expect(points).toEqual([0, 0, 5, 5]);
  });

  it('builds a smooth path that starts and ends on the stroke', () => {
    const d = strokeToPath([0, 0, 10, 10, 20, 0, 30, 10]);
    expect(d.startsWith('M0 0')).toBe(true);
    expect(d).toContain('Q10 10 15 5');
    expect(d.endsWith('L30 10')).toBe(true);
  });
});
