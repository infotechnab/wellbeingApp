# iPhone test builds with TestFlight

With the paid Apple Developer account, the app can go to testers through
[TestFlight](https://developer.apple.com/testflight/), Apple's beta app. Testers install TestFlight
from the App Store, open a link, and tap **Install**. Nothing is public on the App Store, builds
last 90 days, and a newer build updates the app like any other.

The build runs in the cloud with [EAS](https://docs.expo.dev/build/introduction/), Expo's build
service, so it doesn't need Xcode. The first build is started from a computer, because it asks you
to sign in to Apple once; later builds can run from GitHub ([Later builds](#later-builds)).

You need:

- The free Expo account you already use for Expo Go.
- The Apple ID that's an Admin (or Account Holder) of the Apple Developer account.
- The project folder on your Mac, up to date (`git pull`, then `npm ci`).

## 1. Sign in to Expo

In the project folder (the VS Code terminal works):

```bash
npx eas-cli@latest login
```

Type your Expo username and password. Check with `npx eas-cli@latest whoami`.

## 2. Build and upload

```bash
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

It asks a few questions. Answer:

- **Create an EAS project?** Yes. This adds an `extra.eas.projectId` line to `app.json` on your Mac.
- **Log in to your Apple account?** Yes, with the Apple ID above, then the 2-factor code. If it asks which team, pick
  your organisation's team.
- **Generate a new Apple Distribution Certificate / Provisioning Profile?** Yes to each. EAS keeps
  them, so you won't be asked again.
- **Generate a new App Store Connect API Key?** Yes. EAS uses it to upload builds from now on.
- **Create the app on App Store Connect?** Yes. If it says the name is taken (another app on the
  store already uses "Wellbeing"), give it a name such as "Wellbeing Nepal". You can change the name
  in App Store Connect before the public release.

The build then runs in the cloud (about 15 to 30 minutes; a free Expo account may wait in a queue
first). The terminal shows a link to follow it on expo.dev. When it's built, EAS uploads it to App
Store Connect, and Apple takes another 5 to 30 minutes to process it. Apple emails you when it's
ready.

`app.json` now has a local change (the project ID). Don't commit it on `main`; send the line to
Claude so it lands through a pull request, then run `git checkout app.json`.

## 3. Install it on your own iPhone

In [App Store Connect](https://appstoreconnect.apple.com/apps), open the app, then **TestFlight**.

1. Under **Internal Testing**, click **+**, name the group (for example "Team") and add yourself.
   People on the Apple Developer team can be internal testers (up to 100), with no review by Apple.
2. Add the build to the group if it isn't already.
3. On the iPhone, install **TestFlight** from the App Store, sign in with the same Apple ID, open the
   invite email and tap **View in TestFlight → Install**.

## 4. A link for other testers

Anyone, without an Apple account on your team, can install through a public link. Apple reviews
the first build for outside testers (Beta App Review, usually within a day).

1. In **TestFlight**, open **Test Information** (left sidebar) and fill in a feedback email, a short
   description, and the contact details for the reviewer. No sign-in is needed: the reviewer can use
   the app as a guest. Save.
2. Under **External Testing**, click **+**, name the group (for example "Testers") and add the build.
   Click **Submit for Review**.
3. When Apple approves it, open the group and turn on **Public Link**. Copy the link
   (`https://testflight.apple.com/join/…`) and share it. You can cap the number of testers there
   (up to 10,000).

Later builds of the same version usually go to the external group without another full review.

## Later builds

Each build needs a higher build number. EAS counts it for you (`autoIncrement` in `eas.json`), and
Profile shows it next to the version.

**From your Mac:** `git pull`, `npm ci`, then the command from step 2. It doesn't ask the questions
again.

**From GitHub, without a computer:** once the project ID is in `app.json` on `main`, add an Expo
access token to the repository once:

1. On [expo.dev → Access tokens](https://expo.dev/settings/access-tokens), create a token named
   "GitHub" and copy it.
2. In the repository's **Settings → Secrets and variables → Actions**, add a secret named
   `EXPO_TOKEN` with that token.

Then **Actions → iPhone TestFlight → Run workflow** builds `main` and uploads it to TestFlight
(`.github/workflows/iphone.yml`). Add the new build to the tester groups in App Store Connect, or
switch on automatic distribution for the group.

## If something goes wrong

- **"You have no team associated with your Apple account"** or your organisation's team isn't listed: the Apple
  ID isn't on the Developer team yet, or the enrolment isn't finished. Check
  [developer.apple.com/account](https://developer.apple.com/account).
- **"Bundle identifier is not available"**: another Apple team already registered
  `com.infotechnab.wellbeing`. Change `ios.bundleIdentifier` in `app.json` (through a pull request)
  and build again.
- **The build doesn't appear in TestFlight**: Apple is still processing it (up to 30 minutes), or
  it emailed you about a problem with the build.
