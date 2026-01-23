# 🔗 Cryptoverse APIs & Architecture Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  index.html  │  │  home.html   │  │  wallet.html │ ... etc  │
│  │   (Login)    │  │  (Dashboard) │  │  (Trading)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         ├─────────────────┼─────────────────┤                   │
│         ▼                 ▼                 ▼                   │
│  ┌───────────────────────────────────────────────────┐         │
│  │  JavaScript (app.js, api.js, wallet.js, etc.)    │         │
│  │  Makes HTTP Requests to Backend APIs             │         │
│  └────────────────┬────────────────────────────────┘         │
│                   │                                            │
│    HTTP Requests  │    WebSocket Connection (Real-time)       │
│    (REST API)     │    (Socket.io)                             │
│                   │                                            │
└───────────────────┼────────────────────────────────────────────┘
                    │
                    │ http://localhost:3001/api
                    │
┌───────────────────▼────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js + Express)                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  server.js (Port 3001)                                   │ │
│  │  ├─ Auth Routes   (/api/auth/login)                     │ │
│  │  ├─ Wallet Routes (/api/wallet/:userId/*)              │ │
│  │  ├─ Market Routes (/api/market)                         │ │
│  │  └─ WebSocket Handler (Socket.io)                       │ │
│  └──────────────────┬───────────────────────────────────────┘ │
│                     │                                          │
│                     ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  MySQL Database Pool (mysql2/promise)                    │ │
│  │  ├─ Connection Host: localhost                           │ │
│  │  ├─ Port: 3306                                           │ │
│  │  ├─ User: root (XAMPP default)                           │ │
│  │  └─ Database: cryptoverse                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│         XAMPP MySQL Database (Persistent Storage)               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ C:\xampp\mysql\bin\mysqld.exe (Running)                │  │
│  │                                                          │  │
│  │  Database: cryptoverse                                 │  │
│  │  ├─ users        (Login credentials, profiles)        │  │
│  │  ├─ wallets      (User balances)                       │  │
│  │  ├─ transactions (Deposits, withdrawals, trades)       │  │
│  │  ├─ holdings     (Coins owned)                         │  │
│  │  ├─ market_data  (Crypto prices)                       │  │
│  │  └─ admins       (Admin accounts)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔌 All API Endpoints

### **1. Authentication API**

#### Login / Register
```javascript
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "john",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "1234567890",
    "username": "john",
    "password": "password123",
    "email": null,
    "fullName": null
  }
}
```

**What Happens:**
- Checks if user exists in `users` table
- If not → Creates new user with auto-generated ID
- If exists → Validates password
- Auto-creates wallet for new users with 50,000 INR balance
- Stores user ID in browser's `localStorage`

---

### **2. Wallet APIs**

#### Get Wallet Balance & Holdings
```javascript
GET /api/wallet/:userId

Example: GET /api/wallet/1234567890

Response:
{
  "userId": "1234567890",
  "balance": 4200000,
  "coins": {
    "BTC": 0.5,
    "ETH": 2.0
  },
  "transactions": [
    {
      "id": "1234567893",
      "userId": "1234567890",
      "type": "buy",
      "currency": "BTC",
      "amount": 0.5,
      "status": "completed",
      "timestamp": "2026-01-23 10:07:30"
    }
  ]
}
```

**Updates Database:**
- Reads from `wallets` table
- Joins with `holdings` table for coins
- Joins with `transactions` table for history

---

#### Deposit Money
```javascript
POST /api/wallet/:userId/deposit
Content-Type: application/json

Request Body:
{
  "amount": 10000,
  "method": "bank"
}

Response:
{
  "success": true
}
```

**Updates Database:**
- Updates `wallets` table: `balance += amount`
- Inserts into `transactions` table with `type = "deposit"`

---

#### Withdraw Money
```javascript
POST /api/wallet/:userId/withdraw
Content-Type: application/json

Request Body:
{
  "amount": 5000,
  "method": "bank"
}

Response:
{
  "success": true
}
```

**Updates Database:**
- Checks if balance > amount (prevents negative balance)
- Updates `wallets` table: `balance -= amount`
- Inserts into `transactions` table with `type = "withdraw"`

---

#### Buy Cryptocurrency
```javascript
POST /api/wallet/:userId/buy
Content-Type: application/json

Request Body:
{
  "coin": "BTC",
  "amount": 0.5,
  "price": 45230.50,
  "totalCost": 22615.25
}

Response:
{
  "success": true
}
```

**Updates Database:**
- Checks if balance >= totalCost
- Updates `wallets` table: `balance -= totalCost`
- Inserts into `transactions` table with `type = "buy", currency = "BTC"`
- Updates/Inserts into `holdings` table: `BTC += 0.5`

---

### **3. Market Data API**

#### Get All Market Prices
```javascript
GET /api/market

Response:
[
  {
    "id": "btc-1",
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 45230.50,
    "change24h": 2.35
  },
  {
    "id": "eth-1",
    "symbol": "ETH",
    "name": "Ethereum",
    "price": 2850.75,
    "change24h": 1.80
  },
  {
    "id": "usdt-1",
    "symbol": "USDT",
    "name": "Tether",
    "price": 0.9999,
    "change24h": 0.01
  }
]
```

**Data Source:**
- Comes from `market_data` table in MySQL
- Can be updated via admin panel

---

## 🔄 How Data Flows (Step-by-Step Example)

### **Scenario: User Login & Buy Bitcoin**

```
1. USER VISITS APP
   ├─ Browser loads index.html
   ├─ JavaScript (api.js) loads Socket.io library
   └─ api.js checks localStorage for saved user

2. USER CLICKS "LOGIN" with username "alex"
   ├─ app.js calls: loginUser("alex", "123456")
   │
   ├─ api.js sends: POST /api/auth/login
   │  {
   │    "username": "alex",
   │    "password": "123456"
   │  }
   │
   ├─ Backend (server.js) receives request
   │  ├─ Queries MySQL: SELECT * FROM users WHERE username = 'alex'
   │  ├─ User not found → Creates new user
   │  │  INSERT INTO users (id, username, password) VALUES ('1234567890', 'alex', '123456')
   │  │
   │  ├─ Creates wallet for user
   │  │  INSERT INTO wallets (id, userId, currency, balance)
   │  │  VALUES ('wallet-123', '1234567890', 'INR', 4200000)
   │  │
   │  └─ Returns user object to frontend
   │
   ├─ Frontend stores user in localStorage
   ├─ Socket.io subscribes to user: socket.emit('subscribe', 'alex-id')
   └─ Page redirects to home.html

3. USER SEES WALLET BALANCE
   ├─ app.js calls: getWallet()
   │
   ├─ api.js sends: GET /api/wallet/1234567890
   │
   ├─ Backend queries:
   │  ├─ SELECT * FROM wallets WHERE userId = '1234567890'
   │  ├─ SELECT * FROM holdings WHERE userId = '1234567890'
   │  └─ SELECT * FROM transactions WHERE userId = '1234567890'
   │
   ├─ Backend returns:
   │  {
   │    "balance": 4200000,
   │    "coins": {},
   │    "transactions": []
   │  }
   │
   └─ Frontend displays ₹42,00,000 balance

4. USER DEPOSITS ₹100,000
   ├─ wallet.js calls: depositMoney(100000, "bank")
   │
   ├─ api.js sends: POST /api/wallet/1234567890/deposit
   │  {
   │    "amount": 100000,
   │    "method": "bank"
   │  }
   │
   ├─ Backend executes:
   │  ├─ UPDATE wallets SET balance = balance + 100000 WHERE userId = '1234567890'
   │  │  (balance: 4200000 → 4300000)
   │  │
   │  └─ INSERT INTO transactions (id, userId, type, amount, status)
   │     VALUES ('trans-1', '1234567890', 'deposit', 100000, 'completed')
   │
   ├─ WebSocket broadcasts: io.emit('walletUpdate', {...})
   └─ Frontend updates UI in real-time

5. USER CLICKS "BUY 0.1 BTC"
   ├─ market.js calls: buyCrypto('BTC', 0.1, 45230.50, 4523.05)
   │
   ├─ api.js sends: POST /api/wallet/1234567890/buy
   │  {
   │    "coin": "BTC",
   │    "amount": 0.1,
   │    "price": 45230.50,
   │    "totalCost": 4523.05
   │  }
   │
   ├─ Backend validates & executes:
   │  ├─ Check: balance (4300000) >= totalCost (4523.05) ✅
   │  │
   │  ├─ UPDATE wallets SET balance = balance - 4523.05 WHERE userId = '1234567890'
   │  │  (balance: 4300000 → 4295476.95)
   │  │
   │  ├─ INSERT INTO transactions (id, userId, type, currency, amount, status)
   │  │  VALUES ('trans-2', '1234567890', 'buy', 'BTC', 0.1, 'completed')
   │  │
   │  └─ INSERT INTO holdings (id, userId, symbol, amount)
   │     VALUES ('hold-1', '1234567890', 'BTC', 0.1)
   │     OR UPDATE holdings SET amount = 0.1 WHERE userId = '1234567890' AND symbol = 'BTC'
   │
   ├─ WebSocket broadcasts real-time update
   └─ Frontend shows:
      └─ New balance: ₹42,95,476.95
         Your coins: BTC 0.1
         Transactions: [Deposit ₹100,000, Buy 0.1 BTC]
```

---

## 📡 Real-Time Connection (WebSocket/Socket.io)

### Connection Flow
```javascript
// Frontend: api.js
socket = io('http://localhost:3001')

socket.on('connect', () => {
  console.log('Connected to real-time server')
  socket.emit('subscribe', currentUser.id) // Subscribe to user updates
})

socket.on('walletUpdate', (data) => {
  // Update displayed balance and coins in real-time
  wallet.balance = data.balance
  wallet.coins = data.coins
  updateUI()
})
```

### Backend Broadcast
```javascript
// Backend: server.js
io.emit('walletUpdate', {
  timestamp: new Date(),
  balance: newBalance,
  coins: newCoins
})
```

**Result:** Changes show up instantly on the page without refreshing!

---

## 🗄️ Database Tables & How They're Connected

```
┌─────────────────────────────────────────────────────────────┐
│                     users                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ id (PK)        │ username  │ password  │ email      │   │
│  │ 1234567890     │ alex      │ 123456    │ alex@...   │   │
│  └─────────┬───────────────────────────────────────────┘   │
│            │ Unique ID                                     │
│            └──────────────────┐                            │
│                               │ (userId Foreign Key)       │
│                    ┌──────────▼─────────────────────┐       │
│                    │       wallets                  │       │
│                    ├────────────────────────────────┤       │
│                    │ id   │ userId │ currency │ balance     │
│                    │ w1   │ 1234   │ INR │ 4,200,000       │
│                    └─────────┬────────────────────┘         │
│                              │                             │
│          ┌───────────────────┼─────────────────┐           │
│          │                   │                 │           │
│          ▼                   ▼                 ▼           │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│    │ transactions │  │   holdings   │  │ market_data  │  │
│    ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│    │ id           │  │ id           │  │ id           │  │
│    │ userId (FK)  │  │ userId (FK)  │  │ symbol (PK)  │  │
│    │ type: buy    │  │ symbol: BTC  │  │ name: Bitcoin│  │
│    │ amount: 0.1  │  │ amount: 0.1  │  │ price: 45K   │  │
│    │ currency:BTC │  │ updatedAt    │  │ change24h: 2%│  │
│    └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

PK = Primary Key (Unique Identifier)
FK = Foreign Key (Links to parent table)
```

---

## 🔑 Key Points

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | HTML, CSS, JavaScript | User interface |
| **Backend** | Node.js + Express | API server |
| **Database** | MySQL (XAMPP) | Data storage |
| **Real-time** | Socket.io | WebSocket connection |
| **Connection** | HTTP REST API | Frontend ↔ Backend |

---

## 🚀 Complete Data Flow Chain

```
Frontend Event → JavaScript Function → API Call → Backend Route → 
Database Query → MySQL Update → WebSocket Broadcast → 
Frontend Update → UI Refresh → User Sees Changes
```

**Example: User clicks "Deposit ₹10,000"**

```
Button Click (UI)
    ↓
wallet.js: handleDeposit()
    ↓
api.js: depositMoney(10000, 'bank')
    ↓
fetch POST /api/wallet/123/deposit
    ↓
server.js: app.post('/api/wallet/:userId/deposit')
    ↓
MySQL: UPDATE wallets SET balance = balance + 10000
    ↓
MySQL: INSERT INTO transactions (...)
    ↓
Socket.io: io.emit('walletUpdate', {...})
    ↓
Frontend socket.on('walletUpdate') receives update
    ↓
UI shows: Balance: ₹42,10,000 ✅
          Transaction: Deposit ₹10,000 ✅
```

---

## ✅ Summary

Your Cryptoverse app has a **complete 3-tier architecture**:

1. **Presentation Layer** (Frontend) - What users see and interact with
2. **Application Layer** (Backend) - Business logic and data processing
3. **Data Layer** (MySQL Database) - Persistent storage

**All APIs are REST-based** using HTTP requests and **real-time updates via WebSocket**!
