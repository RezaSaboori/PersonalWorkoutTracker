# Fix: Use Free Apple ID for Sideloading

## Problem
EAS is asking for a paid Apple Developer account, but you want to use a **free Apple ID** for sideloading.

## Solution

### Option 1: Let EAS Handle Credentials (Recommended)

When running `eas build:configure`, choose to let EAS handle credentials with your free Apple ID:

```bash
eas build:configure
```

When prompted:
1. **"How would you like to upload your credentials?"**
   - Choose: **"Let EAS handle credentials"** ✅

2. **"Do you want to use your Apple ID for ad-hoc distribution?"**
   - Choose: **"Yes"** ✅

3. **Enter your Apple ID** (free account works)
   - Use your regular Apple ID email
   - Not a paid developer account

4. **Enter Apple ID password**
   - Your regular Apple ID password

EAS will automatically:
- Create a free provisioning profile
- Generate certificates
- Configure for ad-hoc distribution

### Option 2: Manual Credential Setup

If Option 1 doesn't work, you can manually configure:

```bash
# Clear existing credentials
eas credentials

# Choose iOS
# Select "Remove all credentials"
# Then select "Add new credentials"
# Choose "Let EAS handle credentials"
# Enter your free Apple ID
```

### Option 3: Update eas.json for Free Apple ID

The current `eas.json` is already configured for internal distribution. Make sure it looks like this:

```json
{
  "build": {
    "sideload": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## Important Notes

### Free Apple ID Limitations:
- ✅ Works for ad-hoc/internal distribution
- ✅ Can build IPAs for sideloading
- ✅ Apps expire after 7 days (need to re-sideload)
- ⚠️ Limited to 3 apps at once
- ⚠️ May need to refresh certificates occasionally

### What EAS Does:
- Creates a free provisioning profile
- Uses your Apple ID to sign the app
- Generates certificates automatically
- No paid developer account needed!

## Step-by-Step Fix

1. **Run configure command:**
   ```bash
   eas build:configure
   ```

2. **When asked about credentials:**
   - Select: "Let EAS handle credentials"
   - Select: "Yes" for using Apple ID
   - Enter your **free Apple ID** email
   - Enter your Apple ID password

3. **If it asks about developer account:**
   - Say "No" or skip
   - Choose "Use Apple ID instead"

4. **Build the IPA:**
   ```bash
   eas build --profile sideload --platform ios
   ```

## Troubleshooting

### Error: "Need paid developer account"
- Make sure you selected "Let EAS handle credentials"
- Choose "Use Apple ID" not "Developer Account"
- Free Apple ID works for internal distribution

### Error: "Credentials not found"
```bash
# Clear and reconfigure
eas credentials
# Remove all → Add new → Let EAS handle → Use Apple ID
```

### Error: "Provisioning profile failed"
- EAS will automatically create one
- Make sure you're using "internal" distribution
- Free Apple ID can create ad-hoc profiles

## Alternative: Use Preview Profile

If sideload profile has issues, use preview:

```bash
eas build --profile preview --platform ios
```

Both `preview` and `sideload` profiles are configured for internal distribution (ad-hoc).

## Success Indicators

After configuration, you should see:
- ✅ "Credentials configured successfully"
- ✅ "Using Apple ID for signing"
- ✅ "Ad-hoc distribution enabled"

Then your build will work with a free Apple ID!

