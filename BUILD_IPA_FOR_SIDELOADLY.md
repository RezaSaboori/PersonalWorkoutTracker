# Build IPA for Sideloadly (No Developer Account Needed)

Complete guide to build an IPA file that can be sideloaded using Sideloadly without a paid Apple Developer account.

## 🎯 Quick Start

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to EAS

```bash
eas login
```

You'll need:
- An Expo account (free)
- A free Apple ID (not a paid developer account)

### Step 3: Configure Apple Credentials

```bash
eas build:configure
```

When prompted:
- Choose "Let EAS handle credentials" (recommended)
- Use your free Apple ID
- EAS will create a free provisioning profile for ad-hoc distribution

### Step 4: Build the IPA

Use the **sideload** profile (optimized for sideloading):

```bash
eas build --profile sideload --platform ios
```

Or use the **preview** profile:

```bash
eas build --profile preview --platform ios
```

### Step 5: Download the IPA

After the build completes:

1. EAS will provide a download link
2. Or download from: https://expo.dev/accounts/[your-account]/builds
3. Click on your build → Download → Download IPA

## 📱 Using Sideloadly

### Step 1: Install Sideloadly

Download from: https://sideloadly.io/

### Step 2: Connect Your iPhone

1. Connect iPhone via USB
2. Trust the computer on your iPhone
3. Sideloadly should detect your device

### Step 3: Sideload the IPA

1. Open Sideloadly
2. Drag and drop your `.ipa` file
3. Enter your Apple ID (free account works)
4. Click "Start"
5. Enter your Apple ID password when prompted
6. Wait for installation to complete

### Step 4: Trust the App on iPhone

1. Go to Settings → General → VPN & Device Management
2. Tap on your Apple ID
3. Tap "Trust [Your Apple ID]"
4. Tap "Trust" again

## 🔧 Build Profiles Explained

### `sideload` Profile (Recommended)
- ✅ Optimized for sideloading
- ✅ Release build configuration
- ✅ Ad-hoc distribution
- ✅ No development client overhead

### `preview` Profile
- ✅ Also works for sideloading
- ✅ Release build
- ✅ Internal distribution

### `development` Profile
- ⚠️ Includes development client
- ⚠️ Larger file size
- ✅ Good for testing

## ⚠️ Important Notes

### Free Apple ID Limitations

1. **7-Day Expiration**: Apps signed with a free Apple ID expire after 7 days
   - You'll need to re-sideload every week
   - Sideloadly can auto-refresh (with Anisette)

2. **3 App Limit**: Free accounts can have max 3 sideloaded apps at once

3. **Revocation Risk**: Apple may revoke certificates (rare, but possible)

### Solutions

1. **Use Sideloadly's Anisette**: 
   - Enables auto-refresh
   - Keeps apps signed automatically
   - Reduces manual re-signing

2. **AltStore Alternative**:
   - Can also be used to sideload
   - Has built-in refresh mechanism

## 🚀 Build Commands

### Build for Sideloading (Recommended)
```bash
eas build --profile sideload --platform ios
```

### Build Preview Version
```bash
eas build --profile preview --platform ios
```

### Build Development Version
```bash
eas build --profile development --platform ios
```

### Check Build Status
```bash
eas build:list
```

### View Build Details
```bash
eas build:view [build-id]
```

## 📋 Build Configuration

The `eas.json` is already configured with:

```json
{
  "build": {
    "sideload": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release",
        "bundleIdentifier": "com.anonymous.WorkoutTracker"
      }
    }
  }
}
```

This ensures:
- ✅ Ad-hoc distribution (no App Store)
- ✅ Release build (optimized)
- ✅ Correct bundle identifier
- ✅ Physical device build (not simulator)

## 🔍 Troubleshooting

### Build Fails with Credential Error

```bash
# Clear credentials and reconfigure
eas credentials
# Choose "iOS" → "Remove all credentials"
# Then run: eas build:configure
```

### IPA Not Installing

1. **Check iOS Version**: Ensure your iPhone is iOS 18.0+
2. **Check Bundle ID**: Make sure it matches in app.json
3. **Revoke Old Profiles**: Remove old profiles in Sideloadly
4. **Try Different Apple ID**: Sometimes helps

### App Crashes on Launch

1. **Check Device Compatibility**: iOS 18.0+ required
2. **Check Native Modules**: Ensure all modules are built correctly
3. **Check Logs**: Use Xcode or Console app to view crash logs

### Build Takes Too Long

- First build: 15-30 minutes (normal)
- Subsequent builds: 10-20 minutes
- EAS builds in the cloud, so it's normal

## 💡 Tips

1. **Use Sideload Profile**: Optimized for sideloading
2. **Keep Builds**: Download and save IPAs for easy re-installation
3. **Use Anisette**: Enable auto-refresh in Sideloadly
4. **Backup IPA**: Save your IPA files for future use

## 📦 What You Get

After building, you'll have:
- ✅ `.ipa` file ready for sideloading
- ✅ Signed with your Apple ID
- ✅ Works on your iPhone (and up to 2 other devices with same Apple ID)
- ✅ Valid for 7 days (can be refreshed)

## 🎉 You're Ready!

1. Run: `eas build --profile sideload --platform ios`
2. Wait for build to complete
3. Download the IPA
4. Use Sideloadly to install
5. Enjoy your app!

## 🔗 Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Sideloadly Website](https://sideloadly.io/)
- [EAS Build Status](https://expo.dev/accounts/[your-account]/builds)

