# Setup EAS Credentials for Free Apple ID

## The Problem

EAS Build requires credentials to be set up **before** running in CI. Since you're using a free Apple ID, you need to configure credentials interactively on your local machine first.

## Solution: Setup Credentials Locally

### Step 1: Run Credentials Setup (On Your Windows Machine)

```bash
# Make sure you're logged into EAS
eas login

# Configure iOS credentials
eas credentials --platform ios
```

### Step 2: Follow the Prompts

When prompted:

1. **"How would you like to upload your credentials?"**
   - Choose: **"Let EAS handle credentials"** ✅

2. **"Do you want to use your Apple ID for ad-hoc distribution?"**
   - Choose: **"Yes"** ✅

3. **Enter your Apple ID** (your free Apple ID email)
   - Example: `your-email@gmail.com`

4. **Enter Apple ID password**
   - Use your **app-specific password** (not your regular password)
   - Generate one at: https://appleid.apple.com → Security → App-Specific Passwords

5. **If asked about Developer Account:**
   - Choose: **"No"** or **"Use Apple ID instead"**

### Step 3: Verify Credentials

```bash
# Check if credentials are configured
eas credentials --platform ios
```

You should see:
- ✅ "Credentials configured successfully"
- ✅ "Using Apple ID for signing"
- ✅ "Ad-hoc distribution enabled"

### Step 4: Credentials Are Now Stored on EAS Servers

Once configured, the credentials are stored on EAS servers and will be used automatically in CI builds. You don't need to add them to GitHub secrets.

## Alternative: Use GitHub Secrets (If Needed)

If you want to provide Apple ID credentials in CI (not recommended, but possible):

1. **Add GitHub Secrets:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add:
     - `APPLE_ID`: Your Apple ID email
     - `APPLE_APP_SPECIFIC_PASSWORD`: Your app-specific password

2. **The workflow will use these automatically**

## Why This Is Needed

- **Free Apple IDs** can't access Apple Developer Portal API programmatically
- EAS needs credentials to be set up interactively first
- Once set up, they're stored on EAS servers and work in CI
- This is a one-time setup

## Troubleshooting

### Error: "Credentials not found"
- Make sure you ran `eas credentials --platform ios` locally
- Choose "Let EAS handle credentials"
- Enter your free Apple ID

### Error: "Invalid Apple ID password"
- Use an **app-specific password**, not your regular password
- Generate at: https://appleid.apple.com → Security → App-Specific Passwords

### Error: "Need paid developer account"
- Make sure you selected "Use Apple ID" not "Developer Account"
- Free Apple ID works for internal/ad-hoc distribution

## After Setup

Once credentials are configured:
1. ✅ They're stored on EAS servers
2. ✅ CI builds will use them automatically
3. ✅ No need to add to GitHub secrets
4. ✅ Just push your code and the workflow will work!

