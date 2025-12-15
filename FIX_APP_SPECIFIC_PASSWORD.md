# Fix: App-Specific Password Still Not Working

## Problem
Using app-specific password `icua-aknd-bely-gevy` but still getting "Invalid username and password combination".

## Common Issues & Solutions

### 1. Password Format Issue

App-specific passwords should be entered **WITHOUT spaces or dashes** in some tools.

**Try:**
- With dashes: `icua-aknd-bely-gevy`
- Without dashes: `icuaakndbelygevy`
- With spaces: `icua aknd bely gevy`

EAS usually accepts with dashes, but try without if it doesn't work.

### 2. Password Expired or Revoked

App-specific passwords can be revoked if:
- You generated a new one (old ones stop working)
- You revoked it manually
- Apple security detected something

**Solution:**
1. Go to https://appleid.apple.com
2. Sign-In and Security → App-Specific Passwords
3. **Revoke the old one** (icua-aknd-bely-gevy)
4. **Generate a NEW one**
5. Use the new password immediately

### 3. Apple ID Account Issues

Your Apple ID might need verification or have restrictions.

**Check:**
1. Go to https://appleid.apple.com
2. Verify account is active
3. Check for security alerts
4. Ensure no payment method issues
5. Verify email is confirmed

### 4. Try Different Authentication Method

EAS might have issues with app-specific passwords in some cases.

**Alternative: Use EAS Build Directly**

Skip credential setup and let EAS handle it during build:

```bash
# Skip eas credentials, go straight to build
eas build --profile sideload --platform ios
```

EAS will prompt for credentials during build and might handle it differently.

### 5. Clear Keychain and Retry

The password might be cached incorrectly.

**On Windows:**
```powershell
# Clear EAS keychain entries
# EAS stores credentials in Windows Credential Manager
# Go to: Control Panel → Credential Manager → Windows Credentials
# Remove any entries for "expo" or "eas"
```

Or try:
```bash
# Clear and retry
eas credentials
# Choose to remove existing credentials first
```

### 6. Verify App-Specific Password Format

Make sure:
- ✅ No extra spaces before/after
- ✅ All characters are lowercase
- ✅ Dashes are included (or not, depending on what EAS expects)
- ✅ Password is fresh (just generated)

## Step-by-Step Fix

### Method 1: Generate Fresh Password

1. **Revoke old password:**
   - Go to appleid.apple.com
   - App-Specific Passwords
   - Find and revoke `icua-aknd-bely-gevy`

2. **Generate new one:**
   - Click "Generate an app-specific password"
   - Name: "EAS Build"
   - Copy immediately (you can only see it once!)

3. **Use new password:**
   ```bash
   eas credentials
   ```
   - Apple ID: `reza74rsa@gmail.com`
   - Password: **paste the NEW password** (not the old one)

### Method 2: Skip Credential Setup

Build directly and let EAS handle credentials:

```bash
eas build --profile sideload --platform ios
```

When prompted:
- Use your Apple ID
- Use a **fresh** app-specific password
- EAS will create credentials automatically

### Method 3: Check Apple ID Status

1. Visit: https://appleid.apple.com
2. Sign in
3. Check:
   - ✅ Account is active
   - ✅ No security holds
   - ✅ Email verified
   - ✅ No payment issues

## Troubleshooting Commands

```bash
# 1. Clear any cached credentials
eas credentials
# Choose "Remove all credentials"

# 2. Generate NEW app-specific password at appleid.apple.com

# 3. Try credentials again
eas credentials
# Use the NEW password

# OR skip and build directly:
eas build --profile sideload --platform ios
```

## Why This Might Happen

1. **Password was revoked** - Old passwords stop working
2. **Format issue** - EAS might expect specific format
3. **Account restrictions** - Apple ID might have limitations
4. **Network/Apple issues** - Temporary Apple authentication problems
5. **Cached bad password** - Old password stored incorrectly

## Quick Test

Try building directly without credential setup:

```bash
eas build --profile sideload --platform ios
```

This often works better because EAS handles authentication differently during build vs. credential setup.

