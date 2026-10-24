import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Everything is set in app.json. Three build-time switches adjust it:
 * - `APP_VARIANT=local` (set by `npm run iphone`) gives the free test copy for your own iPhone its own bundle
 *   ID: Apple holds on to an ID that a free account has signed for about a week, and the real one has to stay
 *   available for TestFlight and the App Store.
 * - `WEB_BASE_URL` (set by the website workflow) is the path the website is served from, such as
 *   `/wellbeingApp` on GitHub Pages, so the exported files and links get that prefix.
 * - `ANDROID_VERSION_CODE` (set by the Android workflow to its run number) is the test APK's build number,
 *   shown in Profile next to the version, so testers can tell builds apart.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  let expo = config as ExpoConfig;
  if (process.env.APP_VARIANT === 'local') {
    expo = { ...expo, ios: { ...expo.ios, bundleIdentifier: `${expo.ios?.bundleIdentifier}.local` } };
  }
  if (process.env.WEB_BASE_URL) {
    expo = { ...expo, experiments: { ...expo.experiments, baseUrl: process.env.WEB_BASE_URL } };
  }
  if (process.env.ANDROID_VERSION_CODE) {
    expo = { ...expo, android: { ...expo.android, versionCode: Number(process.env.ANDROID_VERSION_CODE) } };
  }
  return expo;
};
