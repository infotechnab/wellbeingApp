import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Everything is set in app.json. `APP_VARIANT=local` (set by `npm run iphone`) only gives the free test
 * copy for your own iPhone its own bundle ID: Apple holds on to an ID that a free account has signed for
 * about a week, and the real one has to stay available for TestFlight and the App Store.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const expo = config as ExpoConfig;
  if (process.env.APP_VARIANT !== 'local') return expo;
  return { ...expo, ios: { ...expo.ios, bundleIdentifier: `${expo.ios?.bundleIdentifier}.local` } };
};
