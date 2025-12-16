# Quick GitHub Setup Guide

## 🚀 Fast Setup (3 Steps)

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `WorkoutTracker`
3. Choose **Private** or **Public**
4. **Don't check** any boxes (no README, .gitignore, license)
5. Click **"Create repository"**

### Step 2: Copy Your Repository URL

After creating, GitHub shows you a URL like:
```
https://github.com/YOUR_USERNAME/WorkoutTracker.git
```

**Copy this URL!**

### Step 3: Add Remote and Push

**Replace `YOUR_REPO_URL` with the URL you copied:**

```bash
git remote add origin YOUR_REPO_URL
git push -u origin master
```

**Example:**
```bash
git remote add origin https://github.com/reza74rsa/WorkoutTracker.git
git push -u origin master
```

---

## ✅ After Pushing

1. Go to your repo: `https://github.com/YOUR_USERNAME/WorkoutTracker`
2. Click **"Actions"** tab
3. You'll see **"Build iOS App (Free Mac Runner)"** workflow
4. Click **"Run workflow"** → **"Run workflow"** button
5. Wait for build (takes ~10-15 minutes)
6. Download IPA from **Artifacts**

---

## ⚠️ Note About GitHub Actions

The workflow I created will build on a Mac, but **signing with free Apple ID requires manual setup in Xcode**.

**Alternative:** Try EAS in Git Bash (better for interactive prompts):

```bash
# Install Git Bash if needed
# Then run:
eas build --profile preview --platform ios

# When asked: NO to Apple login
```

---

## 🎯 What to Do Now

**Option 1: Setup GitHub (for automated builds)**
- Follow steps above
- Push code
- Run workflow

**Option 2: Try EAS in Git Bash (simpler)**
- Install Git Bash
- Run EAS build
- Handle prompts interactively

**Which do you prefer?**

