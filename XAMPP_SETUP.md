# XAMPP Setup Guide for Cryptoverse

## Step 1: Start XAMPP Services
1. Open XAMPP Control Panel
2. Click **Start** next to **Apache** (optional - for serving files)
3. Click **Start** next to **MySQL** (Required)
4. You should see them running with green indicators

**Note:** MySQL will run on `localhost:3306` by default

---

## Step 2: Verify MySQL is Running
Open PowerShell and test the connection:
```powershell
mysql -u root -h localhost
```

If successful, you'll see the MySQL prompt: `mysql>`
Type `exit` to quit.

---

## Step 3: Create Database and User

Run these commands in MySQL:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS cryptoverse;

-- Create user (if not exists)
CREATE USER IF NOT EXISTS 'cryptoverse_user'@'localhost' IDENTIFIED BY 'cryptoverse_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON cryptoverse.* TO 'cryptoverse_user'@'localhost';
FLUSH PRIVILEGES;

-- Switch to database
USE cryptoverse;
```

---

## Step 4: Update Backend Configuration

The backend server (`backend/server.js`) needs MySQL connection details.

**Current Configuration:**
- Host: `localhost`
- Port: `3306`
- User: `root` (default XAMPP user)
- Password: (empty by default)
- Database: `cryptoverse`

---

## Step 5: Initialize Database Tables

From the `backend` folder, run:

```powershell
cd backend
npm install
node setup-mysql.js
```

This will create all required tables:
- users
- wallets
- transactions
- market_data
- trades
- notifications
- bookmarks

---

## Step 6: Start the Backend Server

From the `backend` folder:

```powershell
npm start
```

You should see:
```
Server is running on http://localhost:3001
✅ Connected to MySQL database
```

---

## Step 7: Access the Application

Open in your browser:
```
http://localhost:3001
```

---

## Troubleshooting

### MySQL won't start
- Check if port 3306 is already in use
- Try restarting XAMPP
- Check XAMPP logs for errors

### Connection refused error
- Ensure MySQL is running (green indicator in XAMPP)
- Check username and password in backend/server.js

### Permission denied
- XAMPP default user is `root` with no password
- Update connection string if you created a new user

---

## MySQL Administration

### Access via phpMyAdmin (XAMPP included)
```
http://localhost/phpmyadmin
```
- Username: `root`
- Password: (leave empty)

### Backup Database
```powershell
mysqldump -u root cryptoverse > backup.sql
```

### Restore Database
```powershell
mysql -u root cryptoverse < backup.sql
```

---

## Important Notes

1. **Port 3306**: MySQL default port - don't change unless necessary
2. **Root User**: XAMPP creates `root` with no password by default
3. **Keep Running**: Leave XAMPP running while developing
4. **Windows Firewall**: May need to allow MySQL through firewall if issues occur
