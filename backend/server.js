const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Global DB variables
const dbType = 'mysql';
let mysqlPool = null;

const log = (message, type = 'INFO') => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type}] ${message}`);
};

// Query function for MySQL
async function query(sql, params = []) {
  try {
    const [rows] = await mysqlPool.query(sql, params);

    // Real-time update broadcast
    if (sql.toLowerCase().includes('insert') ||
      sql.toLowerCase().includes('update') ||
      sql.toLowerCase().includes('delete')) {
      io.emit('database:update', {
        timestamp: new Date(),
        query: sql,
        affected: rows.affectedRows || 0
      });
    }
    return rows;
  } catch (err) {
    log(`Query error: ${err.message}`, 'ERROR');
    throw err;
  }
}

// Initialize Database
async function initializeDatabase() {
  log('🔍 Initializing MySQL database...', 'INFO');

  try {
    const tempConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      connectTimeout: 5000
    });

    await tempConn.query('CREATE DATABASE IF NOT EXISTS cryptoverse');
    await tempConn.end();

    mysqlPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cryptoverse',
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0
    });

    log('✅ Connected to MySQL (Real-time Mode)', 'SUCCESS');

    // Initialize schema
    await initializeSchema();
    log(`🚀 Database ready [Mode: MYSQL]`, 'SUCCESS');
  } catch (err) {
    log(`❌ MySQL connection failed: ${err.message}`, 'ERROR');
    log('Please ensure MySQL service is running on localhost.', 'IMPORTANT');
    process.exit(1);
  }
}

async function initializeSchema() {
  // MySQL schema
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      fullName VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS wallets (
      id VARCHAR(255) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      currency VARCHAR(10) NOT NULL,
      balance DECIMAL(20, 8) DEFAULT 0,
      address VARCHAR(255) UNIQUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(255) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      currency VARCHAR(10),
      amount DECIMAL(20, 8) NOT NULL,
      fromAddress VARCHAR(255),
      toAddress VARCHAR(255),
      status VARCHAR(50) DEFAULT 'completed',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_userId (userId),
      INDEX idx_timestamp (timestamp)
    )`,

    `CREATE TABLE IF NOT EXISTS market_data (
      id VARCHAR(255) PRIMARY KEY,
      symbol VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(255),
      price DECIMAL(20, 8),
      change24h DECIMAL(10, 2),
      volume DECIMAL(20, 2),
      marketCap DECIMAL(20, 2),
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS holdings (
      id VARCHAR(255) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      symbol VARCHAR(10) NOT NULL,
      amount DECIMAL(20, 8) DEFAULT 0,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE idx_user_symbol (userId, symbol)
    )`
  ];

  for (const table of tables) {
    try {
      await mysqlPool.query(table);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        log(`Schema error: ${err.message}`, 'WARN');
      }
    }
  }

  // Insert default admin
  try {
    await mysqlPool.query(
      'INSERT INTO admins (id, username, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      ['admin-1', 'admin', '123456', '123456']
    );
  } catch (err) {
    // Ignore duplicates
  }
}

// Start server
(async () => {
  try {
    await initializeDatabase();

    // Root route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

    // Login endpoint
    app.post('/api/auth/login', async (req, res) => {
      const { username, password } = req.body;
      log(`Login attempt: ${username}`, 'INFO');

      if (!username) return res.status(400).json({ error: 'Username required' });

      try {
        const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
        let user = rows[0];

        if (!user) {
          const id = Date.now().toString();
          const defaultPassword = password || '123456';
          await query(
            'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
            [id, username, defaultPassword]
          );
          user = { id, username, password: defaultPassword };
          log(`New user created: ${username}`, 'SUCCESS');
        } else if (password && user.password && user.password !== password) {
          log(`Login failed: Invalid password for ${username}`, 'WARN');
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Ensure wallet exists for the user
        const wRows = await query('SELECT * FROM wallets WHERE userId = ?', [user.id]);
        if (!wRows[0]) {
          const walletId = Date.now().toString();
          await query(
            'INSERT INTO wallets (id, userId, currency, balance) VALUES (?, ?, ?, ?)',
            [walletId, user.id, 'INR', 50000 * 84] // Default balance
          );
          log(`Wallet created for user: ${username}`, 'SUCCESS');
        }

        log(`Login successful: ${username}`, 'SUCCESS');
        res.json({ user });
      } catch (err) {
        log(`Login error: ${err.message}`, 'ERROR');
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // ===== WALLET ROUTES =====
    app.get('/api/wallet/:userId', async (req, res) => {
      const { userId } = req.params;
      try {
        const wRows = await query('SELECT * FROM wallets WHERE userId = ?', [userId]);
        const wallet = wRows[0];
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        const hRows = await query('SELECT symbol as coin, amount FROM holdings WHERE userId = ?', [userId])
          .catch(() => query('SELECT coin, amount FROM holdings WHERE userId = ?', [userId]))
          .catch(() => []);

        const coins = {};
        hRows.forEach(h => coins[h.coin] = h.amount);

        const tRows = await query('SELECT * FROM transactions WHERE userId = ? ORDER BY timestamp DESC LIMIT 50', [userId]);
        res.json({ userId: wallet.userId || wallet.id, balance: wallet.balance, coins, transactions: tRows });
      } catch (err) {
        log(`Wallet error: ${err.message}`, 'ERROR');
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/wallet/:userId/deposit', async (req, res) => {
      const { userId } = req.params;
      const { amount, method } = req.body;
      try {
        await query('UPDATE wallets SET balance = balance + ? WHERE userId = ?', [amount, userId]);
        await query('INSERT INTO transactions (id, userId, type, amount, status) VALUES (?, ?, ?, ?, ?)',
          [Date.now().toString(), userId, 'deposit', amount, 'completed']);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/wallet/:userId/withdraw', async (req, res) => {
      const { userId } = req.params;
      const { amount, method } = req.body;
      try {
        const rows = await query('SELECT balance FROM wallets WHERE userId = ?', [userId]);
        if (!rows[0] || rows[0].balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

        await query('UPDATE wallets SET balance = balance - ? WHERE userId = ?', [amount, userId]);
        await query('INSERT INTO transactions (id, userId, type, amount, status) VALUES (?, ?, ?, ?, ?)',
          [Date.now().toString(), userId, 'withdraw', amount, 'completed']);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/wallet/:userId/buy', async (req, res) => {
      const { userId } = req.params;
      const { coin, amount, price, totalCost } = req.body;
      try {
        const rows = await query('SELECT balance FROM wallets WHERE userId = ?', [userId]);
        if (!rows[0] || rows[0].balance < totalCost) return res.status(400).json({ error: 'Insufficient balance' });

        await query('UPDATE wallets SET balance = balance - ? WHERE userId = ?', [totalCost, userId]);

        await query('INSERT INTO transactions (id, userId, type, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
          [Date.now().toString(), userId, 'buy', amount, coin, 'completed']);

        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get market data
    app.get('/api/market', (req, res) => {
      const market = [
        { id: 'btc-1', symbol: 'BTC', name: 'Bitcoin', price: 45230.50, change24h: 2.35 },
        { id: 'eth-1', symbol: 'ETH', name: 'Ethereum', price: 2850.75, change24h: 1.80 },
        { id: 'usdt-1', symbol: 'USDT', name: 'Tether', price: 0.9999, change24h: 0.01 }
      ];
      res.json(market);
    });

    // WebSocket
    io.on('connection', (socket) => {
      log(`WebSocket client connected: ${socket.id}`, 'INFO');
      socket.on('disconnect', () => {
        log(`WebSocket client disconnected: ${socket.id}`, 'INFO');
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║         🚀 Cryptoverse Backend Server Started 🚀        ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log(`\n✅ Server running on: http://localhost:${PORT}`);
      console.log(`📊 Database: MYSQL (Dedicate Mode)`);
      console.log(`🔥 MySQL Real-Time Mode - Live Updates Enabled`);
      console.log(`🔌 WebSocket: Active\n`);
    });

  } catch (err) {
    log(`Fatal error: ${err.message}`, 'ERROR');
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  log('Shutting down...', 'INFO');
  if (mysqlPool) await mysqlPool.end();
  process.exit(0);
});

