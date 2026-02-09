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
        }
      ],
      chart: {
        type: 'candlestick',
        height: '100%',
        id: 'chart',
        stacked: false,
        background: '#131722', // TradingView Dark Background
        foreColor: '#d1d4dc', // TradingView text color
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        toolbar: {
          show: true,
          autoSelected: 'zoom',
          tools: {
            download: false,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true
        },
        animations: {
          enabled: false // Smoother for real-time
        },
        events: {
          mouseMove: (event, chartContext, config) => {
            if (config.dataPointIndex > -1) {
              const series = config.config.series[0].data[config.dataPointIndex];
              if (series && series.y) {
                this.updateOHLC(series.y[0], series.y[1], series.y[2], series.y[3]);
              }
            }
          },
          mouseLeave: () => {
            // Revert to latest candle data when mouse leaves
            const latest = this.candlesData[this.candlesData.length - 1];
            if (latest && latest.y) {
              this.updateOHLC(latest.y[0], latest.y[1], latest.y[2], latest.y[3]);
            }
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        labels: { colors: '#d1d4dc' }
      },
      title: {
        show: false // We use our own legend now
      },
      xaxis: {
        type: 'datetime',
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#787b86', fontSize: '11px' }
        },
        crosshairs: {
          show: true,
          position: 'back',
          stroke: {
            color: '#787b86',
            width: 1,
            dashArray: 4
          }
        }
      },
      yaxis: {
        opposite: true, // TradingView style
        tooltip: {
          enabled: true
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#787b86', fontSize: '11px' },
          formatter: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: {
          show: true,
          format: 'dd MMM HH:mm'
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#089981',      // TradingView Green
            downward: '#f23645'     // TradingView Red
          },
          wick: {
            useFillColor: true
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#2a2e39', // TradingView Grid Color
        strokeDashArray: 2,
        position: 'back',
        xaxis: {
          lines: { show: true }
        },
        yaxis: {
          lines: { show: true }
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
   * Update price display and OHLC legend in UI
   */
  updatePriceDisplay(price, symbol) {
    const priceElement = document.getElementById('current-price');
    if (priceElement) {
      priceElement.textContent = `$${price.toFixed(2)}`;
      priceElement.style.color = price > 0 ? '#089981' : '#f23645';
    }

    // Also update OHLC legend with the latest candle if mouse is not hovering
    const latest = this.candlesData[this.candlesData.length - 1];
    if (latest && latest.y) {
      this.updateOHLC(latest.y[0], latest.y[1], latest.y[2], latest.y[3]);
    }
  }

  /**
   * Update the OHLC overlay legend (TradingView style)
   */
  updateOHLC(o, h, l, c) {
    const legend = document.getElementById('chart-ohlc-legend');
    if (!legend) return;

    const isPos = c >= o;
    const color = isPos ? '#089981' : '#f23645';
    const change = c - o;
    const percent = ((c - o) / o) * 100;

    legend.innerHTML = `
      <span style="color: #d1d4dc; margin-right: 15px;">${this.currentSymbol}</span>
      <span style="color: #787b86;">O</span><span style="color: ${color}; margin: 0 8px 0 4px;">${o.toFixed(2)}</span>
      <span style="color: #787b86;">H</span><span style="color: ${color}; margin: 0 8px 0 4px;">${h.toFixed(2)}</span>
      <span style="color: #787b86;">L</span><span style="color: ${color}; margin: 0 8px 0 4px;">${l.toFixed(2)}</span>
      <span style="color: #787b86;">C</span><span style="color: ${color}; margin: 0 8px 0 4px;">${c.toFixed(2)}</span>
      <span style="color: ${color}; margin-left: 10px;">${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percent.toFixed(2)}%)</span>
    `;
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
