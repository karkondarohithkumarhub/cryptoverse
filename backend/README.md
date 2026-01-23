# Simple JSON Database Backend

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Server will run on**: http://localhost:3000

## Database Structure

The backend uses simple JSON files stored in `backend/database/`:

- `users.json` - User accounts
- `wallets.json` - User wallets with balances and coins

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login or create user
  ```json
  { "username": "YourName" }
  ```

### Wallet Operations
- `GET /api/wallet/:userId` - Get wallet data
- `PUT /api/wallet/:userId` - Update wallet
- `POST /api/wallet/:userId/deposit` - Add money
- `POST /api/wallet/:userId/withdraw` - Withdraw money
- `POST /api/wallet/:userId/buy` - Buy cryptocurrency

## How It Works

1. User logs in with username
2. Backend creates/finds user in `users.json`
3. Backend creates wallet in `wallets.json`
4. All transactions saved to JSON files
5. Data persists between sessions!

## Notes

- No complex database setup needed
- Data stored in simple JSON files
- Easy to view and edit database files
- Perfect for development and small projects
