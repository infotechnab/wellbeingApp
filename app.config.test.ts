import type { ConfigContext } from 'expo/config';

import appConfig from './app.config';
import appJson from './app.json';

const context = { config: appJson.expo } as unknown as ConfigContext;
const bundleId = appJson.expo.ios.bundleIdentifier;

describe('app config', () => {
  afterEach(() => {
    delete process.env.APP_VARIANT;
  });

  it('keeps the real bundle ID for store builds', () => {
    expect(appConfig(context)).toEqual(appJson.expo);
  });

  it('gives the free iPhone test copy its own bundle ID and nothing else', () => {
    process.env.APP_VARIANT = 'local';
    const config = appConfig(context);
    expect(config.ios?.bundleIdentifier).toBe(`${bundleId}.local`);
    expect({ ...config, ios: { ...config.ios, bundleIdentifier: bundleId } }).toEqual(appJson.expo);
  });
});
