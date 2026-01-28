# 👥 TEAM COLLABORATION GUIDE - How to Push Code to Repository

---

## 📋 TABLE OF CONTENTS

1. [Getting Access](#getting-access)
2. [Initial Setup](#initial-setup)
3. [Daily Workflow](#daily-workflow)
4. [Making Changes](#making-changes)
5. [Pushing Code](#pushing-code)
6. [Handling Conflicts](#handling-conflicts)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

# 1. GETTING ACCESS

## Step 1️⃣: Get Invited to Repository

**You (Project Owner) need to:**

1. Go to: https://github.com/karkondarohithkumarhub/cryptoverse
2. Click **Settings** → **Collaborators** (or "Access" → "Collaborators")
3. Click **Add people**
4. Enter teammate's GitHub username
5. Select role: **Maintain** or **Push access**
6. Click **Add [username] to this repository**

**Teammate will receive an invitation email** ✉️

## Step 2️⃣: Teammate Accepts Invitation

1. Teammate checks email for GitHub invitation
2. Clicks the link in the email
3. Clicks **Accept invitation**
4. Now has access! ✅

---

# 2. INITIAL SETUP

## 🔧 One-Time Setup for Each Teammate

### Step 1: Install Git

**Windows:**
- Download: https://git-scm.com/download/win
- Run installer, accept defaults
- Restart computer

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

**Verify:**
```powershell
git --version
```

### Step 2: Configure Git

Set up your identity (one-time only):

```powershell
git config --global user.name "Your Full Name"
git config --global user.email "your.email@gmail.com"
```

**Example:**
```powershell
git config --global user.name "Rahul Kumar"
git config --global user.email "rahul.kumar@gmail.com"
```

**Verify:**
```powershell
git config --global --list
```

### Step 3: Clone the Repository

Choose a location and clone:

```powershell
# Navigate to where you want the project
cd "C:\Users\YourName\Desktop"

# Clone the repository
git clone https://github.com/karkondarohithkumarhub/cryptoverse.git

# Navigate into project
cd cryptoverse
```

**Output:**
```
Cloning into 'cryptoverse'...
remote: Enumerating objects: 52, done.
Receiving objects: 100% (52/52), done.
```

### Step 4: Install Dependencies

```powershell
cd backend
npm install
```

**Wait for all packages to install** ⏳

### Step 5: Start Local Server

```powershell
npm start
```

**Output:**
```
✅ Server running on: http://localhost:3001
📊 Database: MYSQL (Dedicate Mode)
🔌 WebSocket: Active
```

**Your local setup is complete!** ✅

---

# 3. DAILY WORKFLOW

## 🔄 Before Starting Work Each Day

### Pull Latest Changes

```powershell
cd cryptoverse
git pull origin main
```

**Why?** Get the latest code from teammates before you start

**Output:**
```
Already up to date.
or
Updating abc1234..def5678
Fast-forward
 backend/server.js | 10 ++
 1 file changed, 10 insertions(+)
```

---

# 4. MAKING CHANGES

## ✏️ How to Make Code Changes

### Option A: Simple Changes (Direct to Main)

**For small bugfixes or minor updates:**

```powershell
# Pull latest
git pull origin main

# Make your changes in VS Code
# Edit files...
# Test locally...

# Check what changed
git status

# Stage changes
git add .

# Commit
git commit -m "Fix login button alignment"

# Push to GitHub
git push origin main
```

### Option B: Feature Branch (Recommended for Big Features)

**For new features or major changes:**

```powershell
# Pull latest
git pull origin main

# Create a new branch
git checkout -b feature/new-feature-name

# Example:
# git checkout -b feature/email-verification
# git checkout -b feature/2fa-authentication
# git checkout -b feature/advanced-charts
```

**Make your changes in this branch:**

```powershell
# Edit files...
# Test locally...

# Stage and commit
git add .
git commit -m "Add email verification system"

# Push this branch to GitHub
git push origin feature/new-feature-name
```

**Create Pull Request on GitHub:**
1. Go to: https://github.com/karkondarohithkumarhub/cryptoverse
2. You'll see: **"Compare & pull request"** button
3. Click it
4. Add description of changes
5. Click **"Create pull request"**
6. Project owner reviews and merges

---

# 5. PUSHING CODE

## 📤 Complete Push Workflow

### Step 1: Check Status
```powershell
git status
```

**Output:**
```
On branch main
Changes not staged for commit:
  modified:   js/app.js
  modified:   backend/server.js

Untracked files:
  new_file.js
```

### Step 2: Stage Changes
```powershell
# Stage specific file
git add js/app.js

# Or stage all changes
git add .
```

### Step 3: Commit Changes
```powershell
git commit -m "Add user profile page"
```

**Good commit messages:**
```
✅ "Add user profile page"
✅ "Fix wallet balance bug"
✅ "Update market price API"
❌ "changes"
❌ "update"
❌ "fix"
```

### Step 4: Pull Latest (Avoid Conflicts)
```powershell
git pull origin main
```

### Step 5: Push to GitHub
```powershell
git push origin main
```

**Output:**
```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 512 bytes
To https://github.com/karkondarohithkumarhub/cryptoverse.git
   abc1234..def5678  main -> main
```

**✅ Your code is now on GitHub!**

---

# 6. HANDLING CONFLICTS

## 🔥 When Merge Conflicts Happen

### Scenario
Two teammates edit the same file → Conflict!

### How to Resolve

```powershell
# Try to push
git push origin main

# Error: Updates were rejected
# Because the remote branch has changes you don't have

# Pull the latest changes
git pull origin main

# You'll see markers in the file:
# <<<<<<< HEAD
# Your changes here
# =======
# Their changes here
# >>>>>>> origin/main
```

### Manually Fix Conflicts

1. Open the file in VS Code
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Keep the code you want, delete the markers
4. Save the file

**Example:**

```javascript
// Before (with conflict)
<<<<<<< HEAD
const price = 45230.50;  // Your change
=======
const price = 45000;     // Teammate's change
>>>>>>> origin/main

// After (fixed)
const price = 45230.50;  // You decided to keep this
```

### Complete the Merge

```powershell
# Stage the fixed file
git add js/app.js

# Commit the merge
git commit -m "Resolve merge conflict in app.js"

# Push
git push origin main
```

---

# 7. BEST PRACTICES

## ✅ DO's

```
✅ Pull before starting work
✅ Commit frequently with clear messages
✅ Test before pushing
✅ Use feature branches for big features
✅ Keep commits small and focused
✅ Write descriptive commit messages
✅ Pull before pushing
✅ Review changes before committing
✅ Use branches for experimental code
✅ Document your changes
```

## ❌ DON'Ts

```
❌ Don't commit node_modules (use .gitignore)
❌ Don't commit .env files (security risk!)
❌ Don't force push (git push --force)
❌ Don't commit large binary files
❌ Don't make vague commit messages
❌ Don't work on main branch for big changes
❌ Don't commit without testing
❌ Don't ignore merge conflicts
❌ Don't push without pulling first
❌ Don't commit database files
```

---

# 8. TROUBLESHOOTING

## 🆘 Common Issues & Solutions

### Issue 1: "Permission denied (publickey)"

**Cause:** Authentication issue

**Solution:**
```powershell
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/karkondarohithkumarhub/cryptoverse.git

# Or create a Personal Access Token
# Go to: https://github.com/settings/tokens
# Copy token
# Use token as password when Git asks
```

---

### Issue 2: "fatal: not a git repository"

**Cause:** Not in the project folder

**Solution:**
```powershell
# Navigate to project folder
cd cryptoverse

# Verify you're in git repo
git status
```

---

### Issue 3: "Updates were rejected"

**Cause:** Remote has changes you don't have

**Solution:**
```powershell
# Pull latest
git pull origin main

# Fix any conflicts
# Then push
git push origin main
```

---

### Issue 4: "error: Your local changes would be overwritten"

**Cause:** Uncommitted changes exist

**Solution:**
```powershell
# Option 1: Commit your changes
git add .
git commit -m "Your message"
git pull origin main

# Option 2: Discard changes (careful!)
git reset --hard origin/main
```

---

### Issue 5: Can't see latest changes

**Cause:** Not pulling regularly

**Solution:**
```powershell
# Always pull before working
git pull origin main

# Check status
git status
```

---

# 📋 QUICK REFERENCE CARD

## Essential Commands

```powershell
# Setup (one-time)
git clone https://github.com/karkondarohithkumarhub/cryptoverse.git
cd cryptoverse
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Daily workflow
git pull origin main              # Get latest code
git status                        # See what changed
git add .                         # Stage changes
git commit -m "Description"       # Commit
git push origin main              # Upload to GitHub

# Branch workflow (for features)
git checkout -b feature/name      # Create branch
# Make changes...
git add .
git commit -m "Feature description"
git push origin feature/name      # Push branch
# Create Pull Request on GitHub

# Checking changes
git log                           # See commit history
git diff                          # See changes before staging
git show abc1234                  # See specific commit
```

---

# 🚀 STEP-BY-STEP TEAM SETUP EXAMPLE

## Scenario: New Teammate "Rahul" Joins

### Day 1: Initial Setup (30 minutes)

```powershell
# Rahul gets GitHub invite email and accepts it

# 1. Install Git
Download from https://git-scm.com/download/win

# 2. Configure Git
git config --global user.name "Rahul Kumar"
git config --global user.email "rahul@gmail.com"

# 3. Clone project
cd Desktop
git clone https://github.com/karkondarohithkumarhub/cryptoverse.git
cd cryptoverse

# 4. Setup backend
cd backend
npm install

# 5. Test
npm start
# See: ✅ Server running on: http://localhost:3001
```

### Day 2: Make First Contribution

```powershell
# 1. Pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feature/fix-wallet-display

# 3. Make changes in VS Code
# Edit: js/wallet.js
# Edit: css/style.css

# 4. Test locally
# Open http://localhost:3001
# Test the changes

# 5. Commit
git add .
git commit -m "Fix wallet balance display formatting"

# 6. Push
git push origin feature/fix-wallet-display

# 7. Create Pull Request on GitHub
# Go to GitHub → Click "Compare & pull request"
# Describe changes
# Click "Create pull request"

# 8. Owner reviews and merges
# Your changes are live!
```

---

# 👥 TEAM COLLABORATION WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│           CRYPTOVERSE TEAM WORKFLOW                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Teammate 1          Teammate 2          Teammate 3    │
│  (Frontend)          (Backend)           (Database)    │
│      │                   │                   │         │
│      │                   │                   │         │
│  git clone ────────► git clone ────────► git clone     │
│      │                   │                   │         │
│  Create branch       Create branch       Create branch  │
│  feature/UI          feature/API         feature/DB     │
│      │                   │                   │         │
│   Make changes        Make changes        Make changes  │
│   Test locally        Test locally        Test locally  │
│      │                   │                   │         │
│   git add .          git add .            git add .     │
│   git commit         git commit           git commit    │
│      │                   │                   │         │
│   git push           git push             git push      │
│      └───────────────────┬──────────────────┘          │
│                          │                             │
│                    GitHub Repository                   │
│                    (main branch)                        │
│                                                         │
│                    Pull Requests                        │
│                    (Review & Merge)                     │
│                                                         │
│                    All Changes Merged                   │
│                    to Main Branch ✅                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 📚 LEARNING RESOURCES

## Useful Git Resources

1. **Interactive Git Tutorial:** https://learngitbranching.js.org/
2. **Git Documentation:** https://git-scm.com/doc
3. **GitHub Guides:** https://guides.github.com
4. **Git Cheat Sheet:** https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf

## Common Commands Explained

```
git pull origin main
  ↳ Get latest code from GitHub main branch

git checkout -b feature/name
  ↳ Create and switch to new branch

git add .
  ↳ Stage all changes for commit

git commit -m "message"
  ↳ Save changes with description

git push origin main
  ↳ Upload commits to GitHub

git status
  ↳ See what files changed

git log
  ↳ See commit history

git diff
  ↳ See detailed changes
```

---

# ✅ TEAM CHECKLIST

## Before First Contribution
- [ ] GitHub account created
- [ ] Added as collaborator to repository
- [ ] Git installed on computer
- [ ] Git configured (name & email)
- [ ] Repository cloned locally
- [ ] npm dependencies installed (`npm install`)
- [ ] Backend tested locally (`npm start`)
- [ ] Can access http://localhost:3001

## Before Every Push
- [ ] Pulled latest code (`git pull`)
- [ ] Made changes to files
- [ ] Tested changes locally
- [ ] Checked git status (`git status`)
- [ ] Staged changes (`git add .`)
- [ ] Committed with message (`git commit`)
- [ ] Pulled again to avoid conflicts
- [ ] Pushed to GitHub (`git push`)

## After Pushing
- [ ] Checked GitHub to confirm push
- [ ] Created Pull Request (if feature branch)
- [ ] Added description of changes
- [ ] Waited for review/merge

---

# 🎯 SUMMARY FOR YOUR TEAMMATES

**Tell your teammates:**

```
1. Accept the GitHub invitation I sent you

2. Follow this one-time setup:
   - Install Git: https://git-scm.com/download/win
   - Run in PowerShell:
     git config --global user.name "Your Name"
     git config --global user.email "your@email.com"
   - Clone project:
     git clone https://github.com/karkondarohithkumarhub/cryptoverse.git
   - Setup backend:
     cd cryptoverse/backend
     npm install
     npm start

3. Every day:
   - Start: git pull origin main
   - Make changes
   - Test locally
   - Push: git add . → git commit → git push origin main

4. For big features:
   - Create branch: git checkout -b feature/name
   - Push branch: git push origin feature/name
   - Create Pull Request on GitHub
   - Wait for review & merge

Questions? See this guide or ask me!
```

---

## 🚀 YOU'RE READY FOR TEAM COLLABORATION!

Your repository is set up for the entire team to collaborate seamlessly.

**Repository:** https://github.com/karkondarohithkumarhub/cryptoverse

**Happy collaborating!** 👥
