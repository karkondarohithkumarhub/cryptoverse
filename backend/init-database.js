const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'wallet_main.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database:', dbPath);
});

// Initialize tables
db.serialize(() => {
  console.log('\n📊 Creating tables...\n');

  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      fullName TEXT,
      phone TEXT,
      address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
    else console.log('✅ Users table ready');
  });

  // Wallets Table
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      currency TEXT NOT NULL,
      balance DECIMAL(20, 8) DEFAULT 0,
      address TEXT UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating wallets table:', err.message);
    else console.log('✅ Wallets table ready');
  });

  // Transactions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL,
      amount DECIMAL(20, 8) NOT NULL,
      fromAddress TEXT,
      toAddress TEXT,
      status TEXT DEFAULT 'completed',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating transactions table:', err.message);
    else console.log('✅ Transactions table ready');
  });

  // Market Data Table
  db.run(`
    CREATE TABLE IF NOT EXISTS market_data (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price DECIMAL(20, 8) NOT NULL,
      change24h DECIMAL(10, 2),
      volume DECIMAL(20, 2),
      marketCap DECIMAL(20, 2),
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating market_data table:', err.message);
    else console.log('✅ Market data table ready');
  });

  // Trades Table
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      fromCurrency TEXT NOT NULL,
      toCurrency TEXT NOT NULL,
      fromAmount DECIMAL(20, 8) NOT NULL,
      toAmount DECIMAL(20, 8) NOT NULL,
      rate DECIMAL(20, 8),
      status TEXT DEFAULT 'completed',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating trades table:', err.message);
    else console.log('✅ Trades table ready');
  });

  // Sessions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating sessions table:', err.message);
    else console.log('✅ Sessions table ready');
  });

  // Sample Data
  console.log('\n📥 Inserting sample data...\n');

  // Insert sample user
  db.run(
    `INSERT OR IGNORE INTO users (id, username, password, email, fullName, phone) VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-1', 'testuser', 'hashed_password_123456', 'test@cryptoverse.com', 'Test User', '+1234567890'],
    function(err) {
      if (err) {
        console.error('Error inserting user:', err.message);
      } else {
        console.log('✅ Added sample user: testuser');
      }
    }
  );

  // Insert sample wallets
  const wallets = [
    ['wallet-btc', 'user-1', 'BTC', 2.5, '1A1z7agoat3wgZCSh8BqQ2GJjXPvAr7xfv'],
    ['wallet-eth', 'user-1', 'ETH', 15.75, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'],
    ['wallet-usdt', 'user-1', 'USDT', 50000.50, '0x8E870D67F660D95d5be530380D0eC0bd388289C1']
  ];

  wallets.forEach(wallet => {
    db.run(
      `INSERT OR IGNORE INTO wallets (id, userId, currency, balance, address) VALUES (?, ?, ?, ?, ?)`,
      wallet,
      function(err) {
        if (!err) {
          console.log(`✅ Added ${wallet[2]} wallet`);
        }
      }
    );
  });

  // Insert market data
  const marketData = [
    ['btc-1', 'BTC', 'Bitcoin', 45230.50, 2.35, 884700000000, 890000000000],
    ['eth-1', 'ETH', 'Ethereum', 2850.75, 1.80, 342500000000, 350000000000],
    ['usdt-1', 'USDT', 'Tether', 0.9999, 0.01, 95400000000, 95500000000],
    ['bnb-1', 'BNB', 'Binance Coin', 618.50, 3.20, 94500000000, 95000000000],
    ['sol-1', 'SOL', 'Solana', 178.90, 5.15, 58900000000, 59500000000]
  ];

  marketData.forEach(data => {
    db.run(
      `INSERT OR IGNORE INTO market_data (id, symbol, name, price, change24h, volume, marketCap) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data,
      function(err) {
        if (!err) {
          console.log(`✅ Added ${data[1]} market data`);
        }
      }
    );
  });
});

// Close after a delay to let queries execute
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
      process.exit(1);
    }
    console.log('\n✅ Database initialization complete!\n');
    process.exit(0);
  });
}, 1000);
