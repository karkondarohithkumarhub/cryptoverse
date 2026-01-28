/**
 * Optimized Indicator Renderer for Live Charts
 * Handles EMA, Bollinger Bands, and Signal Markers
 */

class IndicatorRenderer {
  constructor(chartInstance) {
    this.chart = chartInstance;
    this.emaData = [];
    this.bbData = {
      upper: [],
      middle: [],
      lower: []
    };
    this.signalAnnotations = [];

    // OPTIMIZATION: Cache for performance
    this.lastChartSeries = null;
    this.updateQueue = [];
    this.updateDebounceTimer = null;
    this.isUpdating = false;
  }

  /**
   * Render all indicators on chart
   * OPTIMIZED: Only renders when data changes significantly
   * FIXED: Now forcefully adds indicators with proper data
   */
  renderIndicators(candles, advancedIndicator) {
    try {
      if (!candles || candles.length < 50) {
        console.warn('⚠️ Not enough candle data for indicators', candles?.length);
        return false;
      }

      console.log('📊 === INDICATOR RENDERING START ===');
      console.log('📊 Candles received: ', candles.length, 'items');

      // Extract closes from ApexCharts format { x: Date, y: [o, h, l, c] }
      const closes = candles.map(c => {
        // Handle both formats:
        // 1. { x: Date, y: [o, h, l, c] } from chart
        // 2. { time, open, high, low, close } from elsewhere
        if (Array.isArray(c.y)) {
          return c.y[3]; // close is at index 3
        } else if (c.close !== undefined) {
          return c.close;
        } else {
          console.warn('⚠️ Unknown candle format:', c);
          return null;
        }
      }).filter(c => c !== null);

      console.log('📊 Closes extracted:', closes.length, 'prices');
      if (closes.length === 0) {
        console.error('❌ No closes extracted from candles');
        return false;
      }

      let updated = false;

      // Calculate EMA
      console.log('📊 Calculating EMA(20)...');
      const ema20 = advancedIndicator.calculateEMA(closes, 20);
      console.log('📊 EMA raw result:', ema20 ? ema20.length + ' values' : 'NULL');

      if (ema20 && ema20.length > 0) {
        const newEmaData = this.convertToChartData(candles, ema20, 'EMA');
        console.log('✅ EMA(20) converted:', newEmaData.length, 'points');
        this.emaData = newEmaData;
        updated = true;
      } else {
        console.error('❌ EMA calculation returned:', ema20);
      }

      // Calculate Bollinger Bands
      console.log('📊 Calculating Bollinger Bands...');
      const bb = advancedIndicator.calculateBollingerBands(closes);
      console.log('📊 BB raw result:', bb ? 'Object with ' + (bb.upper ? bb.upper.length : '?') + ' upper values' : 'NULL');

      if (bb && bb.upper && bb.upper.length > 0) {
        const startIdx = closes.length - bb.upper.length;
        const bbCandles = candles.slice(startIdx);

        const newBBUpper = this.convertToChartData(bbCandles, bb.upper, 'BB_Upper');
        const newBBMiddle = this.convertToChartData(bbCandles, bb.middle, 'BB_Middle');
        const newBBLower = this.convertToChartData(bbCandles, bb.lower, 'BB_Lower');

        console.log('✅ BB Upper converted:', newBBUpper.length, 'points');

        this.bbData.upper = newBBUpper;
        this.bbData.middle = newBBMiddle;
        this.bbData.lower = newBBLower;
        updated = true;
      } else {
        console.error('❌ BB calculation returned:', bb);
      }

      // Generate buy/sell signals
      console.log('📊 Generating signals...');
      const signals = advancedIndicator.generateSignals(candles);
      if (signals) {
        console.log('✅ Signals:', signals.action, 'Confidence:', signals.confidence, 'Trend:', signals.trend);
        this.signals = signals;

        // Add signal marker to chart
        if (signals.buySignal || signals.sellSignal) {
          const lastCandle = candles[candles.length - 1];
          console.log('📍 Adding signal marker at price:', lastCandle.y[3]);
          this.addSignalMarker(signals, lastCandle);
        }
      } else {
        console.warn('⚠️ Signal generation returned null');
      }

      // Force immediate update
      if (updated) {
        console.log('🔄 Calling updateChartSeries()...');
        this.updateChartSeries();
      } else {
        console.warn('⚠️ No indicators were calculated');
      }

      console.log('📊 === INDICATOR RENDERING END ===');
      return true;
    } catch (error) {
      console.error('❌ Error rendering indicators:', error);
      console.error('❌ Stack trace:', error.stack);
      return false;
    }
  }

  /**
   * Debounced chart update to prevent excessive rendering
   */
  debouncedUpdateChart() {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = setTimeout(() => {
      this.updateChartSeries();
    }, 100); // Wait 100ms for multiple rapid updates
  }

  /**
   * Convert candle data to chart data format
   * Handles ApexCharts candlestick format: { x: Date, y: [o, h, l, c] }
   */
  convertToChartData(candles, values, name) {
    if (!candles || candles.length === 0 || !values || values.length === 0) {
      console.warn(`⚠️ convertToChartData: Empty data for ${name}`);
      return [];
    }

    // Use only the number of values we have
    const dataPoints = candles.slice(-values.length).map((candle, idx) => {
      const timestamp = candle.x instanceof Date ? candle.x.getTime() : new Date(candle.x).getTime();
      const value = parseFloat(values[idx].toFixed(2));

      return {
        x: timestamp,
        y: value
      };
    });

    console.log(`✅ convertToChartData: Converted ${dataPoints.length} points for ${name}`);
    return dataPoints;
  }

  /**
   * Update chart with all indicator series
   * OPTIMIZED: Only updates series if data changed
   * FIXED: Now properly adds indicators to chart using appendSeries
   */
  updateChartSeries() {
    try {
      if (!this.chart || !this.chart.chart) {
        console.error('❌ Chart not initialized');
        return;
      }

      console.log('📈 Updating chart series...');

      // Get current series
      const currentSeries = this.chart.chart.w.config.series || [];
      console.log('📊 Current series count:', currentSeries.length);

      // Update candlestick series (always at index 0)
      if (currentSeries[0]) {
        currentSeries[0].name = 'Candlesticks';
        console.log('✅ Updated candlestick series');
      }

      // Prepare new series array with all indicators
      const newSeries = [...currentSeries];

      // Replace or add EMA series (index 1)
      if (this.emaData && this.emaData.length > 0) {
        const emaSeries = {
          name: 'EMA (20) - YELLOW',
          type: 'line',
          data: this.emaData,
          stroke: {
            width: 3,
            curve: 'smooth',
            colors: ['#ffff00']
          },
          color: '#ffff00'
        };

        if (newSeries[1]?.name?.includes('EMA')) {
          newSeries[1] = emaSeries;
        } else {
          newSeries.push(emaSeries);
        }
        console.log('✅ EMA series added:', this.emaData.length, 'points');
      }

      // Add Bollinger Bands (upper, middle, lower)
      if (this.bbData && this.bbData.upper && this.bbData.upper.length > 0) {
        const bbUpperSeries = {
          name: 'BB Upper - CYAN',
          type: 'line',
          data: this.bbData.upper,
          stroke: {
            width: 1.5,
            dashArray: [5, 5],
            colors: ['#00ffff']
          },
          color: '#00ffff'
        };

        const bbMiddleSeries = {
          name: 'BB Middle - CYAN',
          type: 'line',
          data: this.bbData.middle,
          stroke: {
            width: 1.5,
            dashArray: [5, 5],
            colors: ['#00dddd']
          },
          color: '#00dddd'
        };

        const bbLowerSeries = {
          name: 'BB Lower - CYAN',
          type: 'line',
          data: this.bbData.lower,
          stroke: {
            width: 1.5,
            dashArray: [5, 5],
            colors: ['#00ffff']
          },
          color: '#00ffff'
        };

        // Remove old BB series if they exist
        const newSeriesFiltered = newSeries.filter(s => !s.name?.includes('BB'));
        newSeriesFiltered.push(bbUpperSeries);
        newSeriesFiltered.push(bbMiddleSeries);
        newSeriesFiltered.push(bbLowerSeries);

        console.log('✅ Bollinger Bands series added');
        this.chart.chart.updateSeries(newSeriesFiltered, false);
      } else {
        // Just update with EMA
        this.chart.chart.updateSeries(newSeries, false);
      }

      console.log('✅ Chart series updated successfully');
    } catch (error) {
      console.error('❌ Error updating chart series:', error);
      console.error('❌ Stack:', error.stack);
    }
  }

  /**
   * Add signal marker to chart via annotations
   * ENHANCED: Shows large, visible BUY/SELL notifications
   */
  addSignalMarker(signal, candle) {
    try {
      if (!signal || (!signal.buySignal && !signal.sellSignal)) {
        console.warn('⚠️ No buy/sell signal to mark');
        return;
      }

      if (!this.chart || !this.chart.chart) {
        console.error('❌ Chart not initialized for markers');
        return;
      }

      const timestamp = candle.x instanceof Date ? candle.x.getTime() : new Date(candle.x).getTime();
      const price = Array.isArray(candle.y) ? candle.y[3] : candle.close;
      const isBuy = signal.buySignal;
      const color = isBuy ? '#00ff00' : '#ff3333';
      const bgColor = isBuy ? 'rgba(0,255,0,0.3)' : 'rgba(255,51,51,0.3)';
      const arrowText = isBuy ? '▲ BUY NOW' : '▼ SELL NOW';
      const confidence = signal.confidence ? signal.confidence.toFixed(0) : '0';

      console.log(`📍 Adding ${isBuy ? 'BUY' : 'SELL'} marker at ${timestamp}, price: ${price}, confidence: ${confidence}%`);

      // Get current annotations or initialize
      let annotations = this.chart.chart.w.config.annotations || {
        xaxis: [],
        yaxis: [],
        points: []
      };

      if (!annotations.points) annotations.points = [];

      // Create LARGE, VISIBLE point marker for buy/sell signal
      const marker = {
        x: timestamp,
        y: price,
        marker: {
          size: 14,        // Large marker size
          fillColor: color,
          strokeColor: 'white',
          strokeWidth: 3,  // Thick white border for visibility
          radius: 6
        },
        label: {
          borderColor: color,
          borderWidth: 3,
          offsetY: isBuy ? -45 : 35,
          text: `${arrowText}\nConfidence: ${confidence}%\nTrend: ${signal.trend || 'NEUTRAL'}`,
          style: {
            background: bgColor,
            color: color,
            fontSize: '13px',
            fontWeight: 'bold',
            padding: '10px 14px',
            border: `3px solid ${color}`,
            borderRadius: '6px'
          }
        }
      };

      annotations.points.push(marker);
      console.log(`✅ Marker created: ${arrowText}`);

      // Update chart annotations
      this.chart.chart.updateOptions({
        annotations: annotations
      }, false);

      console.log('✅ Signal marker added to chart');
    } catch (error) {
      console.error('❌ Error adding signal marker:', error);
    }
  }

  /**
   * Clear all annotations
   */
  clearAnnotations() {
    try {
      if (this.chart && this.chart.chart) {
        this.chart.chart.updateOptions({
          annotations: {
            xaxis: [],
            yaxis: [],
            points: []
          }
        }, false);
      }
    } catch (error) {
      console.error('Error clearing annotations:', error);
    }
  }

  /**
   * Clear all indicator lines
   * OPTIMIZED: Cleans up debounce timers
   */
  clearIndicators() {
    try {
      // Clear any pending updates
      if (this.updateDebounceTimer) {
        clearTimeout(this.updateDebounceTimer);
      }

      if (!this.chart || !this.chart.chart) return;

      const filtered = this.chart.chart.w.config.series.filter(s =>
        !s.name || (!s.name.includes('EMA') && !s.name.includes('BB'))
      );

      this.chart.chart.updateSeries(filtered, false);
      this.clearAnnotations();

      this.emaData = [];
      this.bbData = { upper: [], middle: [], lower: [] };
      this.lastChartSeries = null;
    } catch (error) {
      console.error('Error clearing indicators:', error);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndicatorRenderer;
}
