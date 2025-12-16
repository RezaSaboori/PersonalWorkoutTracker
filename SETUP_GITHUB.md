# Setup GitHub Repository for iOS Build

## Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository name:** `WorkoutTracker` (or any name)
3. **Visibility:** Private or Public (your choice)
4. **Don't initialize** with README, .gitignore, or license
5. **Click "Create repository"**

## Step 2: Add Remote and Push

After creating the repo, GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/WorkoutTracker.git

# Push to GitHub
git push -u origin master
```

## Step 3: Run GitHub Actions Workflow

1. **Go to your repo on GitHub**
2. **Click "Actions" tab**
3. **Click "Build iOS App (Free Mac Runner)"**
4. **Click "Run workflow"**
5. **Wait for build to complete**
6. **Download IPA from artifacts**

---

## Alternative: If You Already Have a GitHub Repo

If you already have a GitHub repository:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push
git push -u origin master
```

---

## Quick Commands

```bash
# Check current remotes
git remote -v

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/WorkoutTracker.git

# Push
git push -u origin master
```

