# Manual Credentials Solution for Free Apple ID

## The Problem

Free Apple IDs **cannot access Apple's Developer Portal API** programmatically. EAS needs this API to automatically generate certificates and provisioning profiles.

## Solution: Manual Credentials

Since automatic credential generation doesn't work with free Apple IDs, you need to provide credentials manually.

### Option 1: Use Xcode to Generate Credentials (If You Have a Mac)

If you have access to a Mac:

1. **Install Xcode** from App Store
2. **Generate the project:**
   ```bash
   npx expo prebuild
   ```
3. **Open in Xcode:**
   ```bash
   open ios/WorkoutTracker.xcworkspace
   ```
4. **Sign with your Apple ID:**
   - Select project → Signing & Capabilities
   - Enable "Automatically manage signing"
   - Select your Apple ID team
   - Xcode will create certificates automatically
5. **Export credentials:**
   - The certificates will be in your Keychain
   - You can export them for use with EAS

### Option 2: Create credentials.json Manually (Complex)

This requires manually creating certificates, which is very complex. Not recommended unless you're experienced.

### Option 3: Get a Paid Developer Account

A paid Apple Developer account ($99/year) would solve this:
- Full access to Developer Portal API
- EAS automatic credential generation works
- No manual setup needed

### Option 4: Contact EAS Support

EAS support might have workarounds or alternative methods:

- Email: support@expo.dev
- Explain: "Free Apple ID authenticated but Developer Portal API returns 404"
- Ask: "Is there a way to build with free Apple ID without Developer Portal API access?"

## Why This Happens

- **Free Apple IDs**: Can sign apps locally, but can't access Developer Portal API
- **Paid Developer Accounts**: Full API access, automatic credential generation works
- **Apple's Limitation**: This is by design - free accounts have restricted API access

## Recommended Path Forward

1. **If you have a Mac**: Build locally with Xcode (easiest)
2. **If no Mac**: Consider getting a paid developer account ($99/year)
3. **Alternative**: Contact EAS support for workarounds
4. **Last resort**: Manual credential creation (very complex)

## Temporary Workaround

You could also:
- Wait a few hours/days and try again (Apple servers might have issues)
- Try building at different times
- Check Apple's system status: https://developer.apple.com/system-status/

