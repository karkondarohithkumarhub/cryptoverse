/**
 * Real-Time Chart Handler using Binance API + ApexCharts
 * No TradingView required - 100% Free
 */

class CryptoChart {
  constructor(containerId = 'chart-container') {
    this.containerId = containerId;
    this.chart = null;
    this.candlesData = [];
    this.wsConnection = null;
    this.currentSymbol = 'BTCUSDT'; // Default symbol
    this.interval = '1h'; // Default 1 hour candles
  }

  /**
   * Initialize ApexCharts
   */
  initChart() {
    const options = {
      series: [
        {
          name: 'candles',
          type: 'candlestick',
          data: []
        },
        {
          name: 'EMA (20)',
          type: 'line',
          data: [],
          stroke: { width: 2, curve: 'smooth' },
          color: '#ffff00'
        }
      ],
      chart: {
        type: 'candlestick',
        height: 500,
        id: 'chart',
        stacked: false,
        toolbar: {
          autoSelected: 'zoom',
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        zoom: {
          enabled: true
        }
      },
      title: {
        text: `${this.currentSymbol} - Live Chart (Updated in Real-Time)`,
        align: 'left'
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: function (val) {
            return new Date(val).toLocaleDateString();
          }
        }
      },
      yaxis: {
        tooltip: {
          enabled: true
        },
        labels: {
          formatter: function (val) {
            return '$' + val.toFixed(2);
          }
        }
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: {
          formatter: function (val) {
            return new Date(val).toLocaleString();
          }
        },
        y: {
          formatter: function (val) {
            return val ? '$' + val.toFixed(2) : val;
          }
        },
        style: {
          fontSize: '13px',
          fontWeight: 600
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#00ff88',      // Bright green for upward candles
            downward: '#ff3333'      // Bright red for downward candles
          },
          wick: {
            useFillColor: true
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      }
    };

    this.chart = new ApexCharts(
      document.querySelector(`#${this.containerId}`),
      options
    );
    this.chart.render();
  }

  /**
   * Fetch historical candles from Binance API (Free, No API Key Required)
   */
  async fetchHistoricalData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
    try {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      this.candlesData = data.map(candle => ({
        x: new Date(candle[0]),
        y: [
          parseFloat(candle[1]), // open
          parseFloat(candle[2]), // high
          parseFloat(candle[3]), // low
          parseFloat(candle[4])  // close
        ]
      }));

      // Update chart with historical data
      this.chart.updateSeries([
        {
          data: this.candlesData
        }
      ]);

      console.log(`✅ Loaded ${this.candlesData.length} candles for ${symbol} (${interval})`);
      return this.candlesData;
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
    }
  }

  /**
   * Connect to Binance WebSocket for Real-Time Data
   * Interval options: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 1w, 1M
   */
  connectWebSocket(symbol = 'BTCUSDT', interval = '1h') {
    const wsUrl = `wss://stream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`;

    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log(`🔌 WebSocket Connected for ${symbol} (${interval})`);
    };

    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const candle = data.k; // kline object

      // Only update on candle close (real-time)
      if (candle.x) {
        // Candle closed
        const newCandle = {
          x: new Date(candle.T),
          y: [
            parseFloat(candle.o), // open
            parseFloat(candle.h), // high
            parseFloat(candle.l), // low
            parseFloat(candle.c)  // close
          ]
        };

        // Check if candle already exists
        const lastCandle = this.candlesData[this.candlesData.length - 1];
        if (
          lastCandle &&
          lastCandle.x.getTime() === newCandle.x.getTime()
        ) {
          // Update existing candle
          this.candlesData[this.candlesData.length - 1] = newCandle;
        } else {
          // Add new candle
          this.candlesData.push(newCandle);
          // Keep only last 100 candles for performance
          if (this.candlesData.length > 200) {
            this.candlesData.shift();
          }
        }

        // Update chart
        this.chart.updateSeries([
          {
            data: this.candlesData
          }
        ]);

        // Update price in UI
        this.updatePriceDisplay(parseFloat(candle.c), symbol);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
    };

    this.wsConnection.onclose = () => {
      console.log('🔌 WebSocket Disconnected - Reconnecting...');
      setTimeout(() => this.connectWebSocket(symbol, interval), 3000);
    };
  }

  /**
   * Update price display in UI
   */
  updatePriceDisplay(price, symbol) {
    const priceElement = document.getElementById('current-price');
    if (priceElement) {
      priceElement.textContent = `$${price.toFixed(2)}`;
      priceElement.style.color = price > 0 ? '#26a69a' : '#ef5350';
    }
  }

  /**
   * Change displayed cryptocurrency and chart interval
   */
  async changeSymbol(symbol, interval = '1h') {
    this.currentSymbol = symbol;
    this.interval = interval;

    // Close old WebSocket
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    // Clear old data
    this.candlesData = [];

    // Update chart title
    this.chart.updateOptions({
      title: {
        text: `${symbol} - Live Chart (${interval})`
      }
    });

    // Fetch new data
    await this.fetchHistoricalData(symbol, interval, 100);

    // Connect to new WebSocket
    this.connectWebSocket(symbol, interval);

    console.log(`📊 Switched to ${symbol} (${interval} candles)`);
  }

  /**
   * Get current price without WebSocket (REST API fallback)
   */
  async getCurrentPrice(symbol = 'BTCUSDT') {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
      );
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  }

  /**
   * Get 24h statistics
   */
  async get24hStats(symbol = 'BTCUSDT') {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );
      const data = await response.json();
      return {
        price: parseFloat(data.lastPrice),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        change24h: parseFloat(data.priceChangePercent),
        openPrice: parseFloat(data.openPrice)
      };
    } catch (error) {
      console.error('Error fetching 24h stats:', error);
      return null;
    }
  }

  /**
   * Cleanup - Close WebSocket connection
   */
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    console.log('✅ Chart disconnected');
  }
}

// ============================================
// USAGE EXAMPLE
// ============================================

/**
 * Initialize Chart on Page Load
 */
// Cleanup on page unload
// window.addEventListener('beforeunload', () => {
//   chartHandler.disconnect();
// });


// ============================================
// BINANCE SUPPORTED INTERVALS
// ============================================
// 1m, 3m, 5m, 15m, 30m
// 1h, 2h, 4h, 6h, 12h
// 1d, 3d, 1w, 1M

// ============================================
// BINANCE SUPPORTED SYMBOLS (Examples)
// ============================================
// BTCUSDT - Bitcoin
// ETHUSDT - Ethereum
// BNBUSDT - Binance Coin
// ADAUSDT - Cardano
// DOGEUSDT - Dogecoin
// XRPUSDT - Ripple
// LTCUSDT - Litecoin
// SOLUSDT - Solana
// MATICUSDT - Polygon
// AVAXUSDT - Avalanche

// For full list: https://api.binance.com/api/v3/exchangeInfo
