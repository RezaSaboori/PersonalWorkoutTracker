# Fix: Apple 403 Error During Authentication

## Problem
Getting "Apple 403 detected - Access forbidden" when trying to authenticate with Apple ID.

## Common Causes & Solutions

### 1. Two-Factor Authentication (2FA) Required

Apple requires 2FA for developer account access. You need to:

**Solution A: Use App-Specific Password**
1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to "Sign-In and Security" → "App-Specific Passwords"
4. Click "Generate an app-specific password"
5. Name it "EAS Build" or similar
6. Copy the password (format: xxxx-xxxx-xxxx-xxxx)
7. When EAS asks for password, use this app-specific password (NOT your regular password)

**Solution B: Complete 2FA During Login**
- When prompted, enter your Apple ID password
- Then enter the 2FA code from your trusted device
- EAS will handle the session

### 2. Session Expired

The stored session cookie expired.

**Solution:**
```bash
# Clear the stored session
rm -rf C:\Users\Reza\.app-store\auth\reza74rsa@gmail.com

# Or on Windows PowerShell:
Remove-Item -Recurse -Force C:\Users\Reza\.app-store\auth\reza74rsa@gmail.com

# Then try again
eas credentials
```

### 3. Apple Rate Limiting

Apple may be rate-limiting your requests.

**Solution:**
- Wait 10-15 minutes
- Try again
- Use a different network if possible

### 4. Apple ID Not Verified

Your Apple ID might need verification.

**Solution:**
1. Go to https://appleid.apple.com
2. Sign in
3. Verify your account is active
4. Check for any security alerts
5. Complete any pending verifications

### 5. Use Manual Credentials (Alternative)

If automatic authentication keeps failing, you can provide credentials manually.

**Solution:**
1. Create `credentials.json` in your project root
2. Add your credentials (see format below)
3. EAS will use them instead of trying to authenticate

## Step-by-Step Fix

### Method 1: Use App-Specific Password (Recommended)

1. **Generate App-Specific Password:**
   - Visit: https://appleid.apple.com
   - Sign in → Security → App-Specific Passwords
   - Generate new password for "EAS Build"
   - Copy the password

2. **Clear Old Session:**
   ```powershell
   Remove-Item -Recurse -Force C:\Users\Reza\.app-store\auth\reza74rsa@gmail.com
   ```

3. **Try Again:**
   ```bash
   eas credentials
   ```
   - Enter your Apple ID: `reza74rsa@gmail.com`
   - Enter the **app-specific password** (not your regular password)

### Method 2: Manual Credentials File

Create `credentials.json` in your project root:

```json
{
  "ios": {
    "provisioningProfile": {
      "type": "ad-hoc",
      "teamId": "YOUR_TEAM_ID"
    },
    "distributionCertificate": {
      "type": "apple-id"
    }
  }
}
```

But this requires you to manually create certificates, which is complex.

### Method 3: Use EAS Build Without Local Credentials

You can let EAS handle everything in the cloud:

```bash
# Skip local credential setup
eas build --profile sideload --platform ios

# EAS will prompt for Apple ID during build
# Use app-specific password when asked
```

## Quick Fix Commands

```powershell
# 1. Clear expired session
Remove-Item -Recurse -Force C:\Users\Reza\.app-store\auth\reza74rsa@gmail.com

# 2. Generate app-specific password at appleid.apple.com
# 3. Try credentials again
eas credentials

# When asked for password, use app-specific password
```

## Why This Happens

- Apple's security requires 2FA
- Automated tools need app-specific passwords
- Session cookies expire for security
- Apple rate-limits authentication attempts

## Success Indicators

After fixing, you should see:
- ✅ "Successfully authenticated with Apple"
- ✅ "Provisioning profile created"
- ✅ "Certificate generated"
- ✅ "Credentials configured"

## Still Having Issues?

1. **Check Apple ID Status:**
   - Go to appleid.apple.com
   - Ensure account is active
   - No security holds

2. **Try Different Network:**
   - Sometimes network issues cause 403
   - Try mobile hotspot or different WiFi

3. **Wait and Retry:**
   - Apple may have temporary rate limiting
   - Wait 15-30 minutes
   - Try again

4. **Contact Support:**
   - EAS Support: support@expo.dev
   - They can help with credential issues

