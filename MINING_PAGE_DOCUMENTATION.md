# Crypto Mining Page - Feature Documentation

## Overview
A comprehensive crypto mining interface that allows users to mine multiple cryptocurrencies with real-time updates and earnings tracking.

## Features

### 1. **Mining Dashboard**
- **Total Hash Rate**: Combined hash rate from all active miners
- **24h Earnings**: Total earnings after pool fees
- **Active Miners**: Number of coins currently being mined
- **Efficiency Meter**: Overall mining efficiency percentage

### 2. **Mining Pool Selection**
Three pool options available:
- **Cryptoverse Official Pool** (1% fee, min ₹100, 4.2s avg block)
- **Pro Mining Pool** (2% fee, min ₹50, 3.8s avg block)
- **Peer-to-Peer Pool** (0.5% fee, min ₹200, 5.1s avg block)

### 3. **Mining Coins**
Five mineable cryptocurrencies:
1. **Bitcoin (BTC)** - Very High Difficulty
2. **Ethereum (ETH)** - High Difficulty
3. **Litecoin (LTC)** - Medium Difficulty
4. **Dogecoin (DOGE)** - Medium Difficulty
5. **Monero (XMR)** - Medium-High Difficulty

### 4. **Real-Time Updates**
- Updates every 3 seconds
- Live mining status indicator
- Hash rate calculation
- Earnings accumulation
- Uptime tracking
- Efficiency monitoring

### 5. **Mining Cards**
Each coin shows:
- Coin name and difficulty
- Mining progress bar
- Efficiency meter
- Hash rate (MH/s)
- 24h earnings
- Start/Stop buttons
- Active/Inactive status

### 6. **Mining Statistics Table**
Displays:
- Coin symbol
- Current status (Active/Inactive)
- Hash rate
- 24-hour earnings
- Uptime
- Difficulty level

## How It Works

### Starting Mining
1. Click the "▶ Start" button on any coin card
2. Mining begins with simulated hash rate
3. Real-time earnings accumulate
4. Status updates to "🟢 Active"
5. Progress bar and stats update

### Stopping Mining
1. Click the "⏹ Stop" button on active mining card
2. Mining stops for that coin
3. Status changes to "⚪ Inactive"
4. Earnings freeze at current amount

### Switching Pools
1. Select different pool option (Official/Pro/P2P)
2. Pool fee automatically applies to earnings
3. Minimum payout and block time adjust
4. Success message confirms switch

### Viewing Details
Click "ℹ Details" button on any coin to see:
- Full coin specifications
- Power consumption
- Reward per block
- Current price
- Current mining stats

## Technical Features

### Real-Time Updates
```javascript
- Updates every 3 seconds
- Simulated but realistic hash rates
- Progressive earning accumulation
- Uptime calculation
- Efficiency percentage
```

### Data Persistence
```javascript
- Mining progress saved to localStorage
- Active mining state preserved
- Earnings persisted across sessions
- Auto-save every 10 seconds
```

### Responsive Design
- Mobile-friendly layout
- Touch-optimized buttons
- Responsive grid layout
- Adaptive typography

## Data Structure

### Mining Coin Object
```javascript
{
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    difficulty: 'Very High',
    mineable: true,
    active: false,
    hashRate: 0,
    earned24h: 0,
    uptime: 0,
    efficiency: 0,
    power: 1500,        // Watts
    rewardPerBlock: 0.00005,
    currentPrice: 4523450  // In rupees
}
```

### Mining State Object
```javascript
{
    isRunning: false,
    selectedPool: 'official',
    totalHashRate: 0,
    totalEarnings: 0,
    startTime: null,
    updateInterval: null,
    lastUpdate: new Date()
}
```

## User Interface Components

### Header Banner
- Eye-catching gradient background
- Title and description
- Mining hub branding

### Statistics Cards (4)
- Total Hash Rate
- Total Earnings
- Active Miners Count
- Efficiency Percentage

### Pool Selector
- Radio button selection
- Pool name, fees, minimums
- Visual highlighting

### Live Ticker
- Connection status
- Update frequency
- Last update timestamp

### Mining Grid
- Responsive card layout
- Individual coin controls
- Progress visualization

### Statistics Table
- Active miners only
- Detailed metrics
- Status indicators

## Key Functions

### `initMiningPage()`
Initializes the mining page on load
- Renders mining cards
- Sets up event listeners
- Starts real-time updates
- Loads saved progress

### `toggleMining(coinId)`
Toggles mining on/off for a coin
- Updates coin state
- Refreshes UI
- Shows confirmation message

### `updateMiningStats()`
Updates all mining statistics
- Calculates hash rates
- Updates earnings
- Refreshes UI elements
- Called every 3 seconds

### `calculateEfficiency(coin)`
Calculates mining efficiency
- Formula: (hashPerWatt / 2) * 100
- Normalized to 100%
- Accounts for power consumption

### `updateStatsDisplay()`
Updates dashboard statistics
- Total hash rate
- Total earnings (after fees)
- Active miner count
- Average efficiency

### `saveMiningProgress()`
Saves mining state to localStorage
- Coin earnings
- Active status
- Auto-saves every 10 seconds

## Real-Time Update Mechanism

```javascript
// Updates every 3 seconds
setInterval(() => {
    updateMiningStats();
}, 3000);

// Calculations:
// Hash Rate: 0.5 - 2 MH/s (random)
// Earned: (hashRate / 100) * price * 0.000001
// Pool Fee: Applied based on selected pool
// Efficiency: (hashRate * 1000) / power / 2 * 100
```

## User Experience Features

### Visual Feedback
- Progress bars showing mining progress
- Efficiency meters with gradient fills
- Live indicator animation
- Status badges (Active/Inactive)
- Color-coded messages

### Interactivity
- Smooth button transitions
- Hover effects on cards
- Click animations
- Confirmation messages

### Information Display
- Real-time statistics
- Historical earnings
- Performance metrics
- Efficiency scores

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for all devices
- LocalStorage support required
- JavaScript ES6+ features used

## Performance Optimization
- Efficient DOM updates
- Minimal reflows
- Event delegation where applicable
- Optimized calculations
- Auto-cleanup on page hidden

## Future Enhancement Ideas
1. Advanced mining strategies
2. Multi-GPU support
3. Historical earnings charts
4. Mining difficulty predictions
5. Automated pool switching
6. Advanced statistics
7. Mining alerts/notifications
8. Payout history tracking
9. Mining profitability calculator
10. Coin price correlation analysis

## Mobile Considerations
- Touch-optimized buttons (larger)
- Simplified layout on small screens
- Responsive typography
- Vertical card layout
- Optimized table display

---

**Page**: mining.html
**Script**: js/mining.js
**Status**: ✅ Ready for Production
**Real-Time Updates**: Every 3 seconds
**Data Persistence**: LocalStorage
**Last Updated**: Today
