import { formatWhen } from '../format';

describe('formatWhen', () => {
  const now = new Date(2026, 9, 23, 18, 0).getTime();

  it('labels today and yesterday', () => {
    expect(formatWhen(new Date(2026, 9, 23, 9, 5).getTime(), now)).toBe('Today, 09:05');
    expect(formatWhen(new Date(2026, 9, 22, 21, 30).getTime(), now)).toBe('Yesterday, 21:30');
  });

  it('uses day and month for older dates', () => {
    expect(formatWhen(new Date(2026, 9, 3, 7, 0).getTime(), now)).toBe('3 Oct, 07:00');
  });
});
