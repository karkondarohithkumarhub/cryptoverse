# 🚀 Cryptoverse - Cryptocurrency Trading Platform

A full-stack cryptocurrency trading and wallet management platform built with Node.js, Express, and MySQL with real-time updates via WebSocket.

## ⚡ Latest Updates (Jan 25, 2026)

**🎉 INDICATOR SYSTEM OPTIMIZED!**
- ✅ 52% faster indicator calculations
- ✅ 60% less memory usage
- ✅ 80% CPU reduction
- ✅ 100% backward compatible

📚 See [INDICATOR_DELIVERY_REPORT.md](INDICATOR_DELIVERY_REPORT.md) for details!

## ✨ Features

- 🔐 **User Authentication** - Secure login/register system
- 💰 **Wallet Management** - Deposit, withdraw, and manage balances
- 📈 **Live Trading** - Buy/sell cryptocurrency with real-time prices
- 💎 **Multiple Assets** - Trade Bitcoin, Ethereum, and 20+ cryptocurrencies
- 🔄 **Real-Time Updates** - WebSocket connection for instant updates
- 📊 **Market Data** - Live cryptocurrency prices and market trends
- ⚡ **Advanced Indicators** - 6 technical indicators optimized for performance
- 💼 **Transaction History** - Track all your trades and transactions
- 🗂️ **Portfolio Tracking** - View your holdings and asset allocation
- 👥 **Admin Panel** - Manage users and market data
- 🎨 **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0 |
| **Real-Time** | Socket.io (WebSocket) |
| **Server** | XAMPP (Apache + MySQL) |

## 📋 Prerequisites

- Windows/Mac/Linux
- [XAMPP](https://www.apachefriends.org/) (for MySQL)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start XAMPP MySQL

- Open XAMPP Control Panel
- Click **Start** next to MySQL
- Verify connection: `mysql -u root -h localhost`

### 3. Start Backend Server

```bash
npm start
```

Expected output:
```
✅ Server running on: http://localhost:3001
📊 Database: MYSQL (Dedicate Mode)
🔥 MySQL Real-Time Mode - Live Updates Enabled
🔌 WebSocket: Active
```

### 4. Open in Browser

```
http://localhost:3001
```

## 📊 Database Structure

### Tables
- **users** - User accounts and credentials
- **wallets** - User wallet balances
- **transactions** - All buy/sell/deposit/withdraw records
- **holdings** - User's cryptocurrency holdings
- **market_data** - Live cryptocurrency prices
- **admins** - Admin accounts

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login/register user |
| `/api/wallet/:userId` | GET | Get wallet balance & holdings |
| `/api/wallet/:userId/deposit` | POST | Deposit money |
| `/api/wallet/:userId/withdraw` | POST | Withdraw money |
| `/api/wallet/:userId/buy` | POST | Buy cryptocurrency |
| `/api/market` | GET | Get market data |

## 📁 Project Structure

```
cryptoverse/
├── backend/
│   ├── server.js           # Main backend server
│   ├── init-database.js    # Database initialization
│   ├── package.json
│   └── database/
│       └── (MySQL tables)
├── js/
│   ├── api.js              # API client functions
│   ├── app.js              # Main application logic
│   ├── wallet.js           # Wallet functions
│   ├── market.js           # Market/trading functions
│   └── theme.js            # UI theme
├── css/
│   └── style.css           # Styling
├── index.html              # Login page
├── home.html               # Dashboard
├── wallet.html             # Wallet page
├── market.html             # Trading page
└── README.md               # This file
```

## 🎮 Default Credentials

First-time login automatically creates an account:
- **Username:** Any username you want
- **Password:** Any password (default: 123456)

## 💻 Development

### Environment Setup

For macOS/Linux:
```bash
export API_URL=http://localhost:3001/api
```

For Windows PowerShell:
```powershell
$env:API_URL="http://localhost:3001/api"
```

### Database Management

Access MySQL via phpMyAdmin:
```
http://localhost/phpmyadmin
```
- Username: `root`
- Password: (leave empty)

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test thoroughly

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Test before committing

## 🐛 Known Issues & Limitations

- Prices are mocked (not real-time from external API)
- No actual payment gateway integration
- Admin panel is basic
- Mobile UI could be improved

## 📝 Future Enhancements

- [ ] Real cryptocurrency prices via CoinGecko API
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Two-factor authentication
- [ ] Advanced charting with TradingView
- [ ] Notification system
- [ ] Mobile app (React Native)
- [ ] Blockchain integration
- [ ] Email verification

## 📚 Documentation

See additional documentation:
- [API Architecture](./API_ARCHITECTURE.md) - Complete API reference
- [XAMPP Setup](./XAMPP_SETUP.md) - Database setup guide
- [GitHub Setup](./GITHUB_SETUP.md) - Collaboration guide

## 🚨 Security Notes

⚠️ **WARNING**: This is a demo/learning project. For production:
- Implement proper authentication (JWT tokens)
- Hash passwords securely (bcrypt)
- Use environment variables for secrets
- Implement rate limiting
- Add input validation
- Use HTTPS
- Never commit sensitive data

## 📧 Contact & Support

- **Issues:** Create an issue on GitHub
- **Discussions:** Use GitHub Discussions
- **Email:** zubair@example.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- XAMPP for local development environment
- Socket.io for real-time functionality
- Express.js community
- All contributors

---

**Made with ❤️ for cryptocurrency enthusiasts**

**Join us in building the future of crypto trading!** 🚀
