# Setup EXPO_TOKEN for GitHub Actions

## Why You Need This

The EAS workflow needs an Expo access token to authenticate with Expo's services.

## Steps to Get Your Token

1. **Go to Expo Dashboard:**
   - Visit: https://expo.dev/accounts/[your-account]/settings/access-tokens
   - Or: https://expo.dev → Your Account → Settings → Access Tokens

2. **Create a New Token:**
   - Click "Create Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token (you'll only see it once!)

3. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: Paste your token
   - Click **Add secret**

## Verify It Works

After adding the secret, re-run the workflow. The "Verify EAS Authentication" step should now pass!

---

## Alternative: Use Main Workflow (No Token Needed)

If you don't want to set up the token, use the **main workflow** (`.github/workflows/ios-build.yml`) instead:
- Uses xcodebuild directly
- No Expo token required
- Works with free Apple ID

