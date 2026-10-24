import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { formatVersion } from './format';

/**
 * This copy's version, such as "1.0.0 (build 12)". The version is `expo.version` in app.json and the
 * build number is the installed app's own (Android's versionCode, iOS's CFBundleVersion), so testers
 * can say exactly which build they have. The web has no build number.
 */
export const appVersion = formatVersion(
  Application.nativeApplicationVersion ?? Constants.expoConfig?.version,
  Application.nativeBuildVersion,
);
