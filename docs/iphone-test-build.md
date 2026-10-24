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
   Components**).
2. **Your Apple account.** In **Xcode → Settings → Accounts**, click **+**, choose **Apple Account**
   and sign in. With your account selected, click **Manage Certificates…**, then **+** → **Apple
   Development**. This puts the signing certificate the build needs on your Mac.
3. **CocoaPods.** In Terminal, run `brew install cocoapods`.
4. **Your iPhone.** Plug it in, unlock it and tap **Trust**. Then on the iPhone, open **Settings →
   Privacy & Security → Developer Mode**, turn it on and let the iPhone restart. If Developer Mode
   isn't listed, open **Xcode → Window → Devices and Simulators** with the iPhone plugged in, then look
   again.

## Build and install

In the project folder (the VS Code terminal works), with the iPhone plugged in and unlocked:

```bash
git pull
npm ci
npm run iphone
```

Pick your iPhone from the list. The first build can take 10 to 20 minutes; later ones are faster.
The app then opens on the iPhone, and it keeps working without the Mac.

The first time, the iPhone says **Untrusted Developer**. Open **Settings → General → VPN & Device
Management**, tap your Apple account under **Developer App**, then **Trust**, and open the app again.

`npm run iphone` rebuilds the `ios/` folder from the project each time. That folder isn't kept in
git, so the command never leaves changes for you to commit.

## Every 7 days

When the app stops opening, plug the iPhone in and run `npm run iphone` again. It installs over the
old copy, so what's saved in the app stays.

## If something goes wrong

- **"No code signing certificates are available to use"**: repeat step 2 of the setup.
- **A signing error during the build**: open `ios/Wellbeing.xcworkspace` in Xcode, click
  **Wellbeing** at the top of the left sidebar, choose the **Wellbeing** target, open **Signing &
  Capabilities**, and pick "*your name* (Personal Team)" under **Team**. Choose your iPhone at the top
  of the window and press ▶ to build from Xcode.
- **The iPhone isn't in the list**: unlock it, check it's plugged in, and tap **Trust** if it asks.
