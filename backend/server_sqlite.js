const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

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

// Global DB
let db = null;

const log = (message, type = 'INFO') => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type}] ${message}`);
};

// Initialize Database
async function initializeDatabase() {
  log('🔍 Initializing SQLite database...', 'INFO');

  try {
    db = await open({
      filename: path.join(__dirname, 'cryptoverse.db'),
      driver: sqlite3.Database
    });

    log('✅ Connected to SQLite', 'SUCCESS');
    await initializeSchema();
    log(`🚀 Database ready [Mode: SQLITE]`, 'SUCCESS');
  } catch (err) {
    log(`❌ SQLite connection failed: ${err.message}`, 'ERROR');
    process.exit(1);
  }
}

async function initializeSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      fullName TEXT,
      phone TEXT,
      address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      currency TEXT NOT NULL,
      balance DECIMAL(20, 8) DEFAULT 0,
      address TEXT UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT,
      amount DECIMAL(20, 8) NOT NULL,
      fromAddress TEXT,
      toAddress TEXT,
      status TEXT DEFAULT 'completed',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS market_data (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT,
      price DECIMAL(20, 8),
      change24h DECIMAL(10, 2),
      volume DECIMAL(20, 2),
      marketCap DECIMAL(20, 2),
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      symbol TEXT NOT NULL,
      amount DECIMAL(20, 8) DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, symbol)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  icon TEXT,
  color TEXT,
  bg TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
)`

  ];

  for (const table of tables) {
    await db.exec(table);
  }

  // Insert default admin
  try {
    await db.run(
      'INSERT OR IGNORE INTO admins (id, username, password) VALUES (?, ?, ?)',
      ['admin-1', 'admin', '123456']
    );
  } catch (err) { }
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
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
          const id = Date.now().toString();
          const defaultPassword = password || '123456';
          await db.run(
            'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
            [id, username, defaultPassword]
          );
          const newUser = { id, username, password: defaultPassword };
          log(`New user created: ${username}`, 'SUCCESS');

           // Create wallet
           const walletId = Date.now().toString();
           await db.run(
             'INSERT INTO wallets (id, userId, currency, balance) VALUES (?, ?, ?, ?)',
             [walletId, id, 'INR', 50000 * 84]
           );
           log(`Wallet created for user: ${username}`, 'SUCCESS');
           
           return res.json({ user: newUser });
        } else if (password && user.password && user.password !== password) {
          log(`Login failed: Invalid password for ${username}`, 'WARN');
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Ensure wallet exists
        const wallet = await db.get('SELECT * FROM wallets WHERE userId = ?', [user.id]);
        if (!wallet) {
          const walletId = Date.now().toString();
           await db.run(
             'INSERT INTO wallets (id, userId, currency, balance) VALUES (?, ?, ?, ?)',
             [walletId, user.id, 'INR', 50000 * 84]
           );
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
        const wallet = await db.get('SELECT * FROM wallets WHERE userId = ?', [userId]);
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        const hRows = await db.all('SELECT symbol as coin, amount FROM holdings WHERE userId = ?', [userId]);
        
        const coins = {};
        hRows.forEach(h => coins[h.coin] = h.amount);

        const tRows = await db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY timestamp DESC LIMIT 50', [userId]);
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
          await db.run('UPDATE wallets SET balance = balance + ? WHERE userId = ?', [amount, userId]);
          await db.run('INSERT INTO transactions (id, userId, type, amount, status) VALUES (?, ?, ?, ?, ?)',
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
          const wallet = await db.get('SELECT balance FROM wallets WHERE userId = ?', [userId]);
          if (!wallet || wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  
          await db.run('UPDATE wallets SET balance = balance - ? WHERE userId = ?', [amount, userId]);
          await db.run('INSERT INTO transactions (id, userId, type, amount, status) VALUES (?, ?, ?, ?, ?)',
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
          const wallet = await db.get('SELECT balance FROM wallets WHERE userId = ?', [userId]);
          if (!wallet || wallet.balance < totalCost) return res.status(400).json({ error: 'Insufficient balance' });
  
          await db.run('UPDATE wallets SET balance = balance - ? WHERE userId = ?', [totalCost, userId]);
  
          await db.run('INSERT INTO transactions (id, userId, type, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
            [Date.now().toString(), userId, 'buy', amount, coin, 'completed']);
          
          await db.run(`INSERT INTO holdings (id, userId, symbol, amount) VALUES (?, ?, ?, ?) 
            ON CONFLICT(userId, symbol) DO UPDATE SET amount = amount + ?`, 
            [`${userId}-${coin}`, userId, coin, amount, amount]);
  
          res.json({ success: true });
        } catch (err) {
            log(err);
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

    // ===== CRYPTO NEWS API (CryptoPanic) =====
    app.get('/api/news', async (req, res) => {
        try {
          const response = await axios.get(
            "https://cryptopanic.com/api/developer/v2/posts/",
            {
              params: {
                auth_token: "55fe02fc0a7d7df468055ae96c11801c2b69c069",
                public: "true",
                currencies: "BTC,ETH,SOL,XRP",
                kind: "news"
              }
            }
          );
      
          res.json(response.data);
        } catch (error) {
          console.error("CryptoPanic API error:", error.message);
          res.status(500).json({ error: "Failed to fetch crypto news" });
        }
      });

    // WebSocket
    io.on('connection', (socket) => {
      log(`WebSocket client connected: ${socket.id}`, 'INFO');
      socket.on('disconnect', () => {
        log(`WebSocket client disconnected: ${socket.id}`, 'INFO');
      });
    });

    server.listen(PORT, () => {
        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║         🚀 Cryptoverse Backend Server Started 🚀        ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n✅ Server running on: http://localhost:${PORT}`);
        console.log(`📊 Database: SQLITE`);
        console.log(`🔌 WebSocket: Active\n`);
    });

  } catch (err) {
    log(`Fatal error: ${err.message}`, 'ERROR');
    process.exit(1);
  }
})();
