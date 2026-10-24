import { formatVersion, formatWhen } from '../format';

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

describe('formatVersion', () => {
  it('adds the build number when there is one', () => {
    expect(formatVersion('1.0.0', '12')).toBe('1.0.0 (build 12)');
  });

  it('shows just the version without a build number, as on the web', () => {
    expect(formatVersion('1.0.0', null)).toBe('1.0.0');
    expect(formatVersion('1.0.0')).toBe('1.0.0');
  });

  it('shows nothing when the version is unknown', () => {
    expect(formatVersion(undefined, '12')).toBeNull();
  });
});
