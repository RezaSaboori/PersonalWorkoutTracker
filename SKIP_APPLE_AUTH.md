# Skip Apple Authentication - Build Without It

## Good News!

The error shows: **"This is optional"** - meaning you can skip Apple account login!

EAS says:
> "If you provide your Apple account credentials we will be able to generate all necessary build credentials and fully validate them. **This is optional**, but without Apple account access you will need to provide all the missing values manually..."

## Solution: Skip Apple Login

When EAS asks:
```
√ Do you want to log in to your Apple account? ... 
```

**Answer: NO** ❌

Then EAS will:
- Ask you to provide credentials manually
- Or use existing credentials if available
- Build will proceed without Apple authentication

## Step-by-Step

1. **Run build again:**
   ```bash
   eas build --profile preview --platform ios
   ```

2. **When asked:**
   ```
   √ Do you want to log in to your Apple account? ... 
   ```
   **Type: `no`** and press Enter

3. **EAS will then:**
   - Ask if you want to provide credentials manually
   - Or use existing credentials
   - Or create new ones without Apple login

4. **Follow the prompts** - EAS will guide you through manual credential setup

## Alternative: Wait and Retry

The error might be temporary (Apple server issue). You can:

1. **Wait 15-30 minutes**
2. **Try again:**
   ```bash
   eas build --profile preview --platform ios
   ```
3. **If it asks for Apple account, say NO** and proceed manually

## Why This Works

- EAS can build without Apple account access
- You just need to provide credentials manually
- Or EAS can use existing credentials
- The build will still work for sideloading

## Next Steps

Try the build again and when it asks:
```
√ Do you want to log in to your Apple account? ... 
```

**Answer: `no`**

Then follow EAS prompts for manual credential setup.

