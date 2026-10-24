# Free test build on your own iPhone

Before the Apple Developer account is ready, a Mac with Xcode can put a test copy of the app on your
own iPhone with a free Apple account. Apple limits this: it only works on iPhones plugged into that
Mac, and the copy stops opening after 7 days, when one command renews it. For other testers, use
TestFlight once the paid account is approved.

The test copy has its own bundle ID (the real one plus `.local`), so the real ID stays free for
TestFlight and the App Store, and both versions can sit side by side on one iPhone later.

You need a Mac, a USB cable and an iPhone on iOS 16.4 or later.

## One-time setup

1. **Xcode.** Install Xcode from the Mac App Store (free, but a large download). Open it once, agree
   to the licence, and install the iOS platform when it asks (or later in **Xcode → Settings →
   Components**). Then in **Xcode → Settings → Locations**, set **Command Line Tools** to that
   Xcode. On a Mac that had Apple's command line tools before Xcode (they come with `git`), this
   setting still points at those, and the build can't find Xcode.
2. **Your Apple account.** In **Xcode → Settings → Accounts**, click **+**, choose **Apple Account**
   and sign in. With your account selected, click **Manage Certificates…**, then **+** → **Apple
   Development**. This puts the signing certificate the build needs on your Mac. To check it, run
   `security find-identity -p codesigning` in Terminal: the last line should say
   `1 valid identities found`. If it says `0 valid identities found`, see
   [If something goes wrong](#if-something-goes-wrong).
3. **CocoaPods.** In Terminal, run `brew install cocoapods`.
4. **Your iPhone.** Plug it in, unlock it and tap **Trust**. Open **Xcode → Window → Devices and
   Simulators** and click your iPhone. If Xcode says it's preparing or copying from the iPhone, wait
   for that to finish; the first time can take about 10 minutes. Then on the iPhone, open
   **Settings → Privacy & Security → Developer Mode**, turn it on and let the iPhone restart.
   Developer Mode is only listed once Xcode has seen the iPhone.

## Build and install

In the project folder (the VS Code terminal works), with the iPhone plugged in and unlocked:

```bash
git pull
npm ci
npm run iphone
```

Pick your iPhone from the list. The first build can take 10 to 20 minutes; later ones are faster.
If the Mac asks for a password so **codesign** can use a key, type your Mac's login password (not
your Apple account password) and click **Always Allow**. The app then opens on the iPhone, and it
keeps working without the Mac.

The first time, the app is installed but doesn't open: the build ends with "The application failed
to launch", because the iPhone doesn't trust your account yet. Open **Settings → General → VPN &
Device Management**, tap your Apple account under **Developer App**, then **Trust** (the iPhone
needs to be online for this), and open the app from the home screen.

`npm run iphone` rebuilds the `ios/` folder from the project each time. That folder isn't kept in
git, so the command never leaves changes for you to commit.

## Every 7 days

When the app stops opening, plug the iPhone in and run `npm run iphone` again. It installs over the
old copy, so what's saved in the app stays.

## If something goes wrong

- **"No code signing certificates are available to use"**: run
  `security find-identity -p codesigning`. If it finds no identities at all, repeat step 2 of the
  setup. If it lists your Apple Development certificate under "Matching identities" but says
  `0 valid identities found`, your Mac is missing Apple's intermediate certificate (Worldwide
  Developer Relations G3) that vouches for yours, which Xcode usually installs by itself. Add it
  from [Apple's certificate page](https://www.apple.com/certificateauthority/), then check again:

  ```bash
  curl -o /tmp/AppleWWDRCAG3.cer https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
  security add-certificates /tmp/AppleWWDRCAG3.cer
  security find-identity -p codesigning
  ```

- **"tool 'xcodebuild' requires Xcode"**: set **Command Line Tools** in **Xcode → Settings →
  Locations** (setup step 1).
- **"Unable to launch … its profile has not been explicitly trusted by the user"**: trust your
  account on the iPhone, as described under [Build and install](#build-and-install).
- **A signing error during the build**: open `ios/Wellbeing.xcworkspace` in Xcode, click
  **Wellbeing** at the top of the left sidebar, choose the **Wellbeing** target, open **Signing &
  Capabilities**, and pick "*your name* (Personal Team)" under **Team**. Choose your iPhone at the top
  of the window and press ▶ to build from Xcode.
- **The iPhone isn't in the list**: unlock it, check it's plugged in, and tap **Trust** if it asks.
