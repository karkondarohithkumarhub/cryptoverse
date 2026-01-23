# Cryptoverse - GitHub Setup Guide

## Step 1: Install Git

### Windows
1. Download Git from: https://git-scm.com/download/win
2. Run the installer and follow the prompts
3. Accept default settings
4. Restart your computer

After installation, verify by opening PowerShell and typing:
```powershell
git --version
```

---

## Step 2: Configure Git (First Time Only)

After installing Git, run these commands in PowerShell:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual GitHub username and email.

---

## Step 3: Initialize Repository

From your project folder (C:\Users\ZUBAIR\OneDrive\Desktop\Cryptoverse):

```powershell
cd "c:\Users\ZUBAIR\OneDrive\Desktop\Cryptoverse"
git init
git add .
git commit -m "Initial commit: Cryptoverse project with XAMPP MySQL integration"
```

---

## Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: **cryptoverse**
3. Description: "Cryptocurrency trading platform with Node.js backend and MySQL"
4. Choose Public (so friends can see) or Private (team only)
5. DO NOT initialize with README (we already have files)
6. Click "Create repository"

---

## Step 5: Push to GitHub

After creating the repository on GitHub, you'll see commands to run. Use these:

```powershell
cd "c:\Users\ZUBAIR\OneDrive\Desktop\Cryptoverse"

# Add remote GitHub repository
git remote add origin https://github.com/YOUR-USERNAME/cryptoverse.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## Step 6: Invite Friends to Collaborate

1. Go to your repository: https://github.com/YOUR-USERNAME/cryptoverse
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter your friends' GitHub usernames
5. They'll receive invitations

---

## Step 7: Teammates Can Clone the Repository

Your friends can get a copy with:

```powershell
git clone https://github.com/YOUR-USERNAME/cryptoverse.git
cd cryptoverse
npm install
```

---

## Step 8: Daily Workflow for Team

### Before working:
```powershell
git pull origin main  # Get latest changes from GitHub
```

### After making changes:
```powershell
git add .
git commit -m "Description of changes"
git push origin main  # Upload to GitHub
```

### Create a branch for big features (recommended):
```powershell
git checkout -b feature/your-feature-name
# Make changes...
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
# Then create Pull Request on GitHub for review
```

---

## Important Files to Keep in .gitignore

These should NOT be pushed to GitHub (too large or sensitive):

```
node_modules/
.env
*.log
database/
MYSQL/
.vscode/
.DS_Store
*.swp
*.swo
Thumbs.db
```

The `.gitignore` file has already been created in your project. ✅

---

## Quick Reference: Common Git Commands

```powershell
# Check status
git status

# View changes
git diff

# View commit history
git log

# Undo last commit (before pushing)
git reset HEAD~1

# Switch branch
git checkout branch-name

# Create new branch
git checkout -b new-branch-name

# Merge branch
git merge branch-name

# Delete branch
git branch -d branch-name
```

---

## Troubleshooting

### "error: src refspec main does not exist"
This means your branch is named something else. Check with:
```powershell
git branch -a
```

Then push the correct branch name.

### Authentication issues
Use GitHub Personal Access Token instead of password:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: repo, workflow
4. Copy the token
5. When Git asks for password, paste the token

### Merge conflicts
When two people edit the same file:
1. Open the conflicted file
2. Look for `<<<<<<`, `======`, `>>>>>` markers
3. Choose which version to keep
4. Delete the markers
5. Save and commit

---

## Best Practices for Team

✅ **DO:**
- Pull before making changes
- Make meaningful commit messages
- Use branches for features
- Test before pushing
- Communicate with team members

❌ **DON'T:**
- Force push (`git push --force`)
- Commit node_modules
- Commit .env files with passwords
- Commit database files
- Merge without testing

---

## Resources

- GitHub Docs: https://docs.github.com
- Git Cheatsheet: https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf
- Interactive Git Tutorial: https://learngitbranching.js.org/

Enjoy collaborating with your team! 🚀
