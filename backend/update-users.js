const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'wallet_main.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
});

db.run(
  `DELETE FROM users WHERE username = ?`,
  ['admin'],
  function(err) {
    if (err) console.error('Error deleting:', err);
    else console.log('✅ Deleted old admin user');
  }
);

db.run(
  `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
  ['admin-1', 'admin', '123456'],
  function(err) {
    if (err) console.error('Error inserting:', err);
    else console.log('✅ Created new admin user with password: 123456');
  }
);

db.run(
  `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
  ['user-1', 'testuser', '123456'],
  function(err) {
    if (err) console.error('Error inserting:', err);
    else console.log('✅ Created test user with password: 123456');
  }
);

setTimeout(() => {
  db.close();
  process.exit(0);
}, 500);
