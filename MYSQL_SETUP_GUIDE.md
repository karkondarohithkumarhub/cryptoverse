# 🚀 Cryptoverse - MySQL Setup Guide

Your Cryptoverse application is now configured to use **MySQL** as the primary real-time database instead of SQLite.

## ⚠️ MySQL Installation Required

Before you can run the application, you need to install MySQL on your Windows system.

### Option 1: MySQL Community Edition (Recommended) ⭐

1. **Download MySQL Community Edition**
   - Visit: https://dev.mysql.com/downloads/mysql/
   - Select **Windows (x86, 64-bit), MSI Installer**
   - Download the latest stable version (8.0.x or newer)

2. **Install MySQL**
   - Run the `.msi` installer
   - Choose "Custom" setup
   - Select "MySQL Server" (ensure port 3306 is selected)
   - Click "Next" through the configuration
   - When asked for a password, you can leave it empty (default for development)
   - **Important:** Add MySQL to your system PATH

3. **Start MySQL Service**
   - Press `Win + R`
   - Type `services.msc`
   - Find "MySQL80" (or similar version)
   - Right-click → "Start"

4. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run: `mysql --version`
   - You should see the version number

### Option 2: Docker (Fastest Alternative) 🐳

If you have Docker installed:

```bash
docker run --name cryptoverse-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=cryptoverse -p 3306:3306 -d mysql:8.0
```

Then in `backend/server.js`, change line with password from `password: ''` to `password: 'root'`

### Option 3: MySQL Community Edition via Chocolatey

If you have Chocolatey installed:

```powershell
choco install mysql -y
```

---

## ✅ Running Cryptoverse with MySQL

Once MySQL is installed and running:

1. **Open Terminal/PowerShell**
   - Navigate to: `C:\Users\ZUBAIR\OneDrive\Desktop\Cryptoverse\backend`

2. **Start the Server**
   ```bash
   node server.js
   ```

3. **Expected Output**
   ```
   ╔════════════════════════════════════════════════════════╗
   ║         🚀 Cryptoverse Backend Server Started 🚀        ║
   ╚════════════════════════════════════════════════════════╝

   ✅ Server running on: http://localhost:3001
   📊 Database: MySQL (Real-time with Live Updates)
   🔌 WebSocket: Active (Real-time notifications)

   💎 Smart Adapter enabled (MySQL optimized)

   Ready to accept connections...
   ```

4. **Open in Browser**
   - Navigate to: http://localhost:3001

---

## 🔐 Login Credentials

- **Username:** `admin`
- **Password:** `123456`

---

## 🎯 Features with Real-Time MySQL

✅ **Real-time Data Synchronization** - All changes instantly saved to MySQL  
✅ **Live WebSocket Updates** - Connected clients get instant notifications  
✅ **Persistent Storage** - Data survives server restarts  
✅ **Multi-user Support** - Multiple users can trade simultaneously  
✅ **Transaction Logging** - Complete audit trail of all operations  
✅ **Market Data Sync** - Live cryptocurrency prices stored in database

---

## 🔧 Database Structure

Your MySQL database includes these tables:

- **users** - User accounts and profiles
- **wallets** - Cryptocurrency wallets (BTC, ETH, USDT, etc.)
- **transactions** - Complete transaction history
- **trades** - Trading records with rates
- **market_data** - Live cryptocurrency prices
- **sessions** - User session management
- **admins** - Administrator accounts

---

## 📊 Real-Time Monitoring

When running, check the server logs to see:
- User login attempts
- Database queries in real-time
- Transaction processing
- Client connections/disconnections
- Any errors or warnings

---

## 🆘 Troubleshooting

### "MySQL connection failed"
- Ensure MySQL Server service is running
- Check Windows Services (services.msc)
- Try restarting MySQL service

### "Port 3306 already in use"
- Another application is using MySQL port
- Restart your computer
- Or configure MySQL to use different port in `backend/server.js`

### "Access denied for user 'root'"
- Check your MySQL password configuration
- Update `backend/server.js` line with `password: ''` to your actual password

### "Can't establish connection"
- Verify MySQL is installed: `mysql --version`
- Check MySQL is running: `services.msc`
- Test connection: `mysql -u root -p` (press Enter for blank password)

---

## 🚀 Next Steps

After successful MySQL setup:

1. Start the server: `node server.js`
2. Open http://localhost:3001
3. Login with admin/123456
4. Start trading cryptocurrency!

---

**Questions or issues?** Check the server console logs for detailed error messages.
