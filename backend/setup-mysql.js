const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'cryptoverse'
};

async function setupDatabase() {
  let connection;

  try {
    console.log('🚀 Starting MySQL Database Setup...\n');

   
    console.log('📝 Connecting to MySQL Server...');
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      connectTimeout: 5000
    });
    console.log('✅ Connected to MySQL Server\n');

   
    console.log('📚 Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database}`);
    console.log(`✅ Database '${DB_CONFIG.database}' ready\n`);

    // Step 3: Select Database
    await connection.query(`USE ${DB_CONFIG.database}`);
    console.log(`✅ Using database '${DB_CONFIG.database}'\n`);

    
    console.log('📊 Creating tables...\n');

    
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(usersTable);
    console.log('✅ Created users table');

    // Admins Table
    const adminsTable = `
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    await connection.query(adminsTable);
    console.log('✅ Created admins table');

    // Wallets Table
    const walletsTable = `
      CREATE TABLE IF NOT EXISTS wallets (
        userId VARCHAR(36) PRIMARY KEY,
        balance DOUBLE DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(walletsTable);
    console.log('✅ Created wallets table');

    // Holdings Table
    const holdingsTable = `
      CREATE TABLE IF NOT EXISTS holdings (
        userId VARCHAR(36),
        coin VARCHAR(50),
        amount DOUBLE DEFAULT 0,
        PRIMARY KEY (userId, coin),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(holdingsTable);
    console.log('✅ Created holdings table');

    // Transactions Table
    const transactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(36),
        type VARCHAR(50),
        amount DOUBLE,
        coin VARCHAR(50),
        price DOUBLE,
        totalCost DOUBLE,
        method VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_timestamp (timestamp)
      )
    `;
    await connection.query(transactionsTable);
    console.log('✅ Created transactions table');

    // Step 5: Insert sample data
    console.log('\n📥 Inserting sample data...\n');

    // Sample user
    try {
      await connection.query(
        'INSERT IGNORE INTO users (id, username, password) VALUES (?, ?, ?)',
        ['user1', 'testuser', 'hashed_password_here']
      );
      console.log('✅ Added sample user (testuser)');
    } catch (err) {
      console.log('ℹ️  Sample user already exists');
    }

    // Sample wallet
    try {
      await connection.query(
        'INSERT IGNORE INTO wallets (userId, balance) VALUES (?, ?)',
        ['user1', 50000]
      );
      console.log('✅ Added sample wallet (₹50,000)');
    } catch (err) {
      console.log('ℹ️  Sample wallet already exists');
    }

    // Sample holdings
    const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
    for (const coin of coins) {
      try {
        await connection.query(
          'INSERT IGNORE INTO holdings (userId, coin, amount) VALUES (?, ?, ?)',
          ['user1', coin, Math.random() * 10]
        );
        console.log(`✅ Added ${coin} holding`);
      } catch (err) {
        // Already exists
      }
    }
    

    // Step 6: Verify tables
    console.log('\n📋 Verifying tables...\n');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log(`✅ ${Object.values(table)[0]}`);
    });

    console.log('\n✨ Database setup completed successfully!');
    console.log('🔗 Configuration:');
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}`);
    console.log('\n📌 Note: Make sure MySQL Server is running on your system!');

    await connection.end();
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\n⚠️  Troubleshooting:');
    console.error('1. Make sure MySQL Server is installed and running');
    console.error('2. Check host, user, and password in DB_CONFIG');
    console.error('3. On Windows, start MySQL: MySQL80 (or your version) in Services');
    process.exit(1);
  }
}

setupDatabase();
