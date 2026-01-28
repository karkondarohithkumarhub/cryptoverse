# Real-Time Charts Integration Guide

## Quick Start (5 Minutes)

### Option 1: Use Pre-Built Chart Page
1. Open `live-charts.html` in your browser
2. Select cryptocurrency and time interval
3. Watch real-time candlestick updates

### Option 2: Integrate Into Your Existing Pages

#### Step 1: Add ApexCharts Library to HTML
```html
<!-- Add this in your <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.45.0/apexcharts.min.js"></script>

<!-- Add this before closing </body> -->
<script src="js/chart.js"></script>
```

#### Step 2: Add Chart Container
```html
<!-- Where you want the chart to appear -->
<div id="chart-container"></div>
```

#### Step 3: Initialize Chart
```javascript
// In your JavaScript file
const chart = new CryptoChart('chart-container');
chart.initChart();
await chart.fetchHistoricalData('BTCUSDT', '1h', 100);
chart.connectWebSocket('BTCUSDT', '1h');
```

---

## How It Works

### 1. **Historical Data (REST API)**
```
GET https://api.binance.com/api/v3/klines
├─ symbol: BTCUSDT (currency pair)
├─ interval: 1h (time interval)
├─ limit: 100 (last 100 candles)
└─ Returns: [timestamp, open, high, low, close, volume, ...]
```

**Response Format:**
```json
[
  [
    1672531200000,        // Candle time
    "42575.00000000",      // Open price
    "42584.99000000",      // High price
    "42549.40000000",      // Low price
    "42556.00000000",      // Close price
    "2123.39300000",       // Volume
    ...
  ]
]
```

### 2. **Real-Time Updates (WebSocket)**
```
WebSocket: wss://stream.binance.com/ws/btcusdt@kline_1h
├─ Connection: Persistent
├─ Latency: < 100ms
├─ Update: Every second (or when price changes)
└─ Automatic Reconnect: Yes (built-in)
```

**WebSocket Message Format:**
```json
{
  "e": "kline",
  "k": {
    "t": 1672531200000,        // Candle open time
    "T": 1672534799999,        // Candle close time
    "s": "BTCUSDT",            // Symbol
    "i": "1h",                 // Interval
    "o": "42575",              // Open
    "h": "42584.99",           // High
    "l": "42549.40",           // Low
    "c": "42556",              // Close
    "v": "2123.393",           // Volume
    "x": true                  // Is candle closed?
  }
}
```

### 3. **Chart Rendering (ApexCharts)**
- Displays candlestick/OHLC chart
- Auto-updates when WebSocket receives new data
- Zoom, pan, download features included
- Mobile responsive

---

## Complete Integration Example

### Step 1: Update Your `market.html`

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.45.0/apexcharts.min.js"></script>
    <style>
        #chart-container {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <!-- Existing content -->
    <div id="chart-container"></div>

    <!-- Scripts -->
    <script src="js/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const chart = new CryptoChart('chart-container');
            chart.initChart();
            await chart.fetchHistoricalData('BTCUSDT', '1h');
            chart.connectWebSocket('BTCUSDT', '1h');
        });
    </script>
</body>
</html>
```

### Step 2: Update Your `js/market.js` or `js/api.js`

```javascript
/**
 * Get chart data for any cryptocurrency
 */
async function getChartData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        const data = await response.json();
        
        return data.map(candle => ({
            time: new Date(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[7])
        }));
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return [];
    }
}

/**
 * Get current price for a symbol
 */
async function getCurrentPrice(symbol = 'BTCUSDT') {
    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error('Error fetching price:', error);
        return null;
    }
}

/**
 * Get 24-hour statistics
 */
async function get24hStats(symbol = 'BTCUSDT') {
    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
        );
        const data = await response.json();
        
        return {
            symbol: data.symbol,
            price: parseFloat(data.lastPrice),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            volume: parseFloat(data.volume),
            change24h: parseFloat(data.priceChangePercent),
            openPrice: parseFloat(data.openPrice)
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}
```

---

## API Comparison

| Feature | Binance | CryptoCompare | CoinGecko |
|---------|---------|---------------|-----------|
| **OHLC Data** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **WebSocket** | ✅ Yes | ❌ No | ❌ No |
| **API Key** | ❌ Not Required | ✅ Required | ❌ Not Required |
| **Rate Limit** | 1200/min | 100/hr | 10-50/s |
| **Cost** | 🟢 Free | 🟢 Free (limited) | 🟢 Free |
| **Recommended** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Supported Cryptocurrencies (Top 50+)

### Major (Top 10):
- BTCUSDT - Bitcoin
- ETHUSDT - Ethereum
- BNBUSDT - Binance Coin
- XRPUSDT - Ripple
- ADAUSDT - Cardano
- DOGEUSDT - Dogecoin
- SOLUSDT - Solana
- LTCUSDT - Litecoin
- BCHUSD - Bitcoin Cash
- MATICUSDT - Polygon

### Get Full List:
```javascript
async function getAllCryptos() {
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await response.json();
    return data.symbols
        .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map(s => s.symbol);
}
```

---

## Time Intervals Supported

| Code | Description |
|------|-------------|
| **1m** | 1 Minute |
| **3m** | 3 Minutes |
| **5m** | 5 Minutes |
| **15m** | 15 Minutes |
| **30m** | 30 Minutes |
| **1h** | 1 Hour |
| **2h** | 2 Hours |
| **4h** | 4 Hours |
| **6h** | 6 Hours |
| **8h** | 8 Hours |
| **12h** | 12 Hours |
| **1d** | 1 Day |
| **3d** | 3 Days |
| **1w** | 1 Week |
| **1M** | 1 Month |

---

## Advanced: Using with Your Backend

### Send Real-Time Updates via Socket.io

**Backend (backend/server.js):**
```javascript
// Add to your existing server code

// Import Binance WebSocket client
const WebSocket = require('ws');

// Store active chart subscriptions
const chartSubscriptions = new Map();

// When user connects, subscribe to chart updates
io.on('connection', (socket) => {
  socket.on('subscribe-chart', (symbol, interval) => {
    const wsUrl = `wss://stream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`;
    
    if (!chartSubscriptions.has(wsUrl)) {
      const ws = new WebSocket(wsUrl);
      
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        // Broadcast to all connected clients
        io.emit('chart-update', {
          symbol,
          interval,
          candle: message.k
        });
      });
      
      chartSubscriptions.set(wsUrl, ws);
    }
  });

  socket.on('disconnect', () => {
    // Cleanup subscriptions
  });
});
```

**Frontend (js/app.js):**
```javascript
// Receive real-time chart updates
socket.on('chart-update', (data) => {
  console.log(`${data.symbol} update:`, data.candle);
  // Update your chart UI here
});

// Subscribe to chart
socket.emit('subscribe-chart', 'BTCUSDT', '1h');
```

---

## Error Handling

### WebSocket Disconnect Recovery
```javascript
const chart = new CryptoChart('chart-container');

// Automatic reconnection happens every 3 seconds
// Check WebSocket status:
console.log(chart.wsConnection.readyState);
// 0 = CONNECTING
// 1 = OPEN
// 2 = CLOSING
// 3 = CLOSED
```

### API Error Handling
```javascript
try {
    await chart.fetchHistoricalData('BTCUSDT', '1h');
} catch (error) {
    console.error('Failed to fetch data:', error);
    // Fallback: Use cached data or show error message
}
```

---

## Performance Tips

1. **Limit Data Points:** Use `limit: 100-200` instead of thousands
2. **WebSocket Only:** Only subscribe to needed symbols/intervals
3. **Cleanup:** Call `chart.disconnect()` when page unloads
4. **Caching:** Cache historical data for 1-5 minutes
5. **Debounce:** Limit chart updates to 1 per second

---

## Troubleshooting

### Chart not loading?
```javascript
// Check if ApexCharts is loaded
console.log(typeof ApexCharts); // Should be 'function'

// Check if container exists
console.log(document.getElementById('chart-container')); // Should exist
```

### WebSocket not connecting?
```javascript
// Check browser console for blocked WebSocket
// Ensure HTTPS if in production
// Check firewall/proxy settings
```

### No data displayed?
```javascript
// Verify Binance API is responding
fetch('https://api.binance.com/api/v3/ping')
  .then(r => r.json())
  .then(() => console.log('✅ Binance API OK'))
  .catch(e => console.log('❌ Binance API Error:', e));
```

---

## Production Checklist

- [ ] Chart displays historical data correctly
- [ ] WebSocket receives real-time updates
- [ ] Chart updates smoothly without lag
- [ ] Error handling for failed API calls
- [ ] Mobile responsive layout tested
- [ ] Performance acceptable (< 100ms updates)
- [ ] WebSocket reconnects on disconnect
- [ ] Clean up resources on page unload

---

## Summary

✅ **Zero Cost** - Completely free APIs and libraries
✅ **Real-Time** - Live candlestick updates < 100ms
✅ **Reliable** - 99.9% uptime infrastructure
✅ **Easy Integration** - Copy-paste ready code
✅ **Professional** - Enterprise-grade charting

## Files Provided

1. **FREE_CHART_APIS.md** - API comparison and recommendations
2. **js/chart.js** - Complete CryptoChart class (100% reusable)
3. **live-charts.html** - Standalone chart page (ready to use)
4. **This guide** - Integration instructions and examples

## Next Steps

1. Open `live-charts.html` to see it in action
2. Test different cryptocurrencies and intervals
3. Copy `js/chart.js` to your project
4. Integrate into your existing pages
5. Customize colors/styling to match your theme
