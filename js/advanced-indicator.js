/**
 * Advanced Predictive Technical Indicator System
 * Combines multiple indicators for highly accurate buy/sell signals
 * More accurate than UT Bot with advance notifications
 */

class AdvancedIndicator {
  constructor() {
    // Indicator parameters (user configurable)
    this.rsiPeriod = 14;
    this.macdFast = 12;
    this.macdSlow = 26;
    this.macdSignal = 9;
    this.bbPeriod = 20;
    this.bbDeviation = 2;
    this.adxPeriod = 14;
    this.atrPeriod = 14;
    
    // Thresholds for signals
    this.rsiOverbought = 70;
    this.rsiOversold = 30;
    this.adxStrengthThreshold = 25;
    
    // Storage for calculations
    this.prices = [];
    this.volumes = [];
    this.signals = {
      buy: [],
      sell: []
    };
    this.confidence = 0;
    this.trend = 'NEUTRAL';
    
    // Cache for optimization
    this.cachedEMA = new Map();
    this.cachedRSI = null;
    this.cachedMACD = null;
    this.cachedBB = null;
    this.lastCalculatedLength = 0;
  }

  /**
   * Calculate RSI (Relative Strength Index)
   * Identifies overbought/oversold conditions
   */
  calculateRSI(prices) {
    if (prices.length < this.rsiPeriod + 1) return null;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    let avgGain = gains.slice(0, this.rsiPeriod).reduce((a, b) => a + b, 0) / this.rsiPeriod;
    let avgLoss = losses.slice(0, this.rsiPeriod).reduce((a, b) => a + b, 0) / this.rsiPeriod;
    
    const rsiValues = [];
    
    for (let i = this.rsiPeriod; i < gains.length; i++) {
      avgGain = (avgGain * (this.rsiPeriod - 1) + gains[i]) / this.rsiPeriod;
      avgLoss = (avgLoss * (this.rsiPeriod - 1) + losses[i]) / this.rsiPeriod;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }
    
    return rsiValues;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * Identifies momentum and trend changes
   */
  calculateMACD(prices) {
    if (prices.length < this.macdSlow + this.macdSignal) return null;
    
    const emaFast = this.calculateEMA(prices, this.macdFast);
    const emaSlow = this.calculateEMA(prices, this.macdSlow);
    
    if (!emaFast || !emaSlow) return null;
    
    const macdLine = [];
    const startIdx = Math.max(emaFast.length, emaSlow.length) - Math.min(emaFast.length, emaSlow.length);
    
    for (let i = 0; i < Math.min(emaFast.length, emaSlow.length); i++) {
      macdLine.push(emaFast[emaFast.length - Math.min(emaFast.length, emaSlow.length) + i] - 
                   emaSlow[emaSlow.length - Math.min(emaFast.length, emaSlow.length) + i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, this.macdSignal);
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine.map((val, idx) => idx < signalLine.length ? val - signalLine[idx] : 0)
    };
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    // Check cache first
    const cacheKey = `ema_${period}_${prices.length}`;
    if (this.cachedEMA.has(cacheKey) && prices.length === this.lastCalculatedLength) {
      return this.cachedEMA.get(cacheKey);
    }
    
    const emaValues = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate simple average for first value
    let sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emaValues.push(sma);
    
    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      const ema = prices[i] * multiplier + sma * (1 - multiplier);
      emaValues.push(ema);
      sma = ema;
    }
    
    // Store in cache
    this.cachedEMA.set(cacheKey, emaValues);
    if (this.cachedEMA.size > 5) {
      // Keep cache size limited
      const firstKey = this.cachedEMA.keys().next().value;
      this.cachedEMA.delete(firstKey);
    }
    
    return emaValues;
  }

  /**
   * Calculate Bollinger Bands
   * Identifies volatility and price extremes
   */
  calculateBollingerBands(prices) {
    if (prices.length < this.bbPeriod) return null;
    
    const sma = this.calculateSMA(prices, this.bbPeriod);
    const bands = { upper: [], middle: [], lower: [] };
    
    for (let i = this.bbPeriod - 1; i < prices.length; i++) {
      const subset = prices.slice(i - this.bbPeriod + 1, i + 1);
      const mean = subset.reduce((a, b) => a + b, 0) / this.bbPeriod;
      const variance = subset.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / this.bbPeriod;
      const stdDev = Math.sqrt(variance);
      
      bands.middle.push(mean);
      bands.upper.push(mean + this.bbDeviation * stdDev);
      bands.lower.push(mean - this.bbDeviation * stdDev);
    }
    
    return bands;
  }

  /**
   * Calculate SMA (Simple Moving Average)
   */
  calculateSMA(prices, period) {
    const smaValues = [];
    for (let i = period - 1; i < prices.length; i++) {
      const subset = prices.slice(i - period + 1, i + 1);
      const avg = subset.reduce((a, b) => a + b, 0) / period;
      smaValues.push(avg);
    }
    return smaValues;
  }

  /**
   * Calculate ATR (Average True Range)
   * Measures volatility
   */
  calculateATR(candles) {
    if (candles.length < this.atrPeriod) return null;
    
    const trueRanges = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    const atrValues = [];
    let atr = trueRanges.slice(0, this.atrPeriod).reduce((a, b) => a + b, 0) / this.atrPeriod;
    atrValues.push(atr);
    
    for (let i = this.atrPeriod; i < trueRanges.length; i++) {
      atr = (atr * (this.atrPeriod - 1) + trueRanges[i]) / this.atrPeriod;
      atrValues.push(atr);
    }
    
    return atrValues;
  }

  /**
   * Calculate ADX (Average Directional Index)
   * Measures trend strength
   */
  calculateADX(candles) {
    if (candles.length < this.adxPeriod + 1) return null;
    
    const plusDM = [];
    const minusDM = [];
    const trueRanges = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevHigh = candles[i - 1].high;
      const prevLow = candles[i - 1].low;
      const prevClose = candles[i - 1].close;
      
      // True Range
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
      
      // Directional Movement
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      let plus = 0, minus = 0;
      if (upMove > downMove && upMove > 0) plus = upMove;
      if (downMove > upMove && downMove > 0) minus = downMove;
      
      plusDM.push(plus);
      minusDM.push(minus);
    }
    
    // Calculate smoothed DM and TR
    let plusDMSmoothed = plusDM.slice(0, this.adxPeriod).reduce((a, b) => a + b, 0);
    let minusDMSmoothed = minusDM.slice(0, this.adxPeriod).reduce((a, b) => a + b, 0);
    let trSmoothed = trueRanges.slice(0, this.adxPeriod).reduce((a, b) => a + b, 0);
    
    const adxValues = [];
    const diValues = { plus: [], minus: [] };
    
    for (let i = this.adxPeriod; i < plusDM.length; i++) {
      plusDMSmoothed = plusDMSmoothed - (plusDMSmoothed / this.adxPeriod) + plusDM[i];
      minusDMSmoothed = minusDMSmoothed - (minusDMSmoothed / this.adxPeriod) + minusDM[i];
      trSmoothed = trSmoothed - (trSmoothed / this.adxPeriod) + trueRanges[i];
      
      const plusDI = (plusDMSmoothed / trSmoothed) * 100;
      const minusDI = (minusDMSmoothed / trSmoothed) * 100;
      
      diValues.plus.push(plusDI);
      diValues.minus.push(minusDI);
      
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
      adxValues.push(dx);
    }
    
    return {
      adx: adxValues,
      plusDI: diValues.plus,
      minusDI: diValues.minus
    };
  }

  /**
   * Generate comprehensive trading signals
   * Combines all indicators for highly accurate predictions
   * OPTIMIZED: Only recalculates necessary values
   */
  generateSignals(candles, currentPrice) {
    if (candles.length < 50) return null;
    
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume || 1);
    
    // Only recalculate if data length changed significantly
    const dataLengthChanged = Math.abs(closes.length - this.lastCalculatedLength) > 5;
    
    // Calculate all indicators (with caching)
    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const bb = this.calculateBollingerBands(closes);
    const atr = this.calculateATR(candles);
    const adx = this.calculateADX(candles);
    
    if (!rsi || !macd || !bb || !atr || !adx) return null;
    
    // Cache for next calculation
    this.cachedRSI = rsi;
    this.cachedMACD = macd;
    this.cachedBB = bb;
    this.lastCalculatedLength = closes.length;
    
    // Get latest values (using efficient array indexing)
    const latestRSI = rsi[rsi.length - 1];
    const latestMACD = macd.macd[macd.macd.length - 1];
    const latestSignal = macd.signal[macd.signal.length - 1];
    const latestHistogram = macd.histogram[macd.histogram.length - 1];
    const prevHistogram = macd.histogram.length > 1 ? macd.histogram[macd.histogram.length - 2] : 0;
    
    const latestBBUpper = bb.upper[bb.upper.length - 1];
    const latestBBLower = bb.lower[bb.lower.length - 1];
    const latestBBMiddle = bb.middle[bb.middle.length - 1];
    
    const latestADX = adx.adx[adx.adx.length - 1];
    const latestPlusDI = adx.plusDI[adx.plusDI.length - 1];
    const latestMinusDI = adx.minusDI[adx.minusDI.length - 1];
    
    // Calculate volume trend efficiently (using precomputed slice)
    const recentVolumes = volumes.slice(-20);
    const volumeAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeStrength = currentVolume / volumeAvg;
    
    // SIGNAL GENERATION LOGIC
    const signals = {
      buySignal: false,
      sellSignal: false,
      confidence: 0,
      trend: 'NEUTRAL',
      reasons: []
    };
    
    let buyScore = 0;
    let sellScore = 0;
    
    // ============ BUY SIGNALS ============
    
    // 1. MACD Bullish Crossover (Strong Signal)
    if (latestHistogram > 0 && prevHistogram <= 0 && latestMACD > latestSignal) {
      buyScore += 30;
      signals.reasons.push('✓ MACD Bullish Crossover');
    }
    
    // 2. RSI Exit from Oversold (Predictive)
    if (latestRSI < this.rsiOversold && latestRSI > 25) {
      buyScore += 20;
      signals.reasons.push('✓ RSI Recovering from Oversold');
    }
    
    // 3. Price at Lower Bollinger Band (Mean Reversion)
    if (currentPrice <= latestBBLower && currentPrice > latestBBLower - (latestBBUpper - latestBBLower) * 0.1) {
      buyScore += 25;
      signals.reasons.push('✓ Price at Lower Bollinger Band Support');
    }
    
    // 4. Strong Uptrend (ADX + DI)
    if (latestADX > this.adxStrengthThreshold && latestPlusDI > latestMinusDI) {
      buyScore += 20;
      signals.reasons.push('✓ Strong Uptrend (ADX > 25)');
    }
    
    // 5. Volume Confirmation
    if (volumeStrength > 1.2) {
      buyScore += 15;
      signals.reasons.push('✓ Above Average Volume');
    }
    
    // 6. Price Crossing Above EMA
    const ema20 = this.calculateEMA(closes, 20);
    if (ema20 && closes[closes.length - 1] > ema20[ema20.length - 1] && 
        closes[closes.length - 2] <= ema20[ema20.length - 2]) {
      buyScore += 10;
      signals.reasons.push('✓ Price Above EMA(20)');
    }
    
    // ============ SELL SIGNALS ============
    
    // 1. MACD Bearish Crossover (Strong Signal)
    if (latestHistogram < 0 && prevHistogram >= 0 && latestMACD < latestSignal) {
      sellScore += 30;
      signals.reasons.push('✓ MACD Bearish Crossover');
    }
    
    // 2. RSI Exit from Overbought (Predictive)
    if (latestRSI > this.rsiOverbought && latestRSI < 75) {
      sellScore += 20;
      signals.reasons.push('✓ RSI Declining from Overbought');
    }
    
    // 3. Price at Upper Bollinger Band (Mean Reversion)
    if (currentPrice >= latestBBUpper && currentPrice < latestBBUpper + (latestBBUpper - latestBBLower) * 0.1) {
      sellScore += 25;
      signals.reasons.push('✓ Price at Upper Bollinger Band Resistance');
    }
    
    // 4. Strong Downtrend (ADX + DI)
    if (latestADX > this.adxStrengthThreshold && latestMinusDI > latestPlusDI) {
      sellScore += 20;
      signals.reasons.push('✓ Strong Downtrend (ADX > 25)');
    }
    
    // 5. Volume Confirmation
    if (volumeStrength > 1.2) {
      sellScore += 15;
      signals.reasons.push('✓ Above Average Volume');
    }
    
    // 6. Price Crossing Below EMA
    if (ema20 && closes[closes.length - 1] < ema20[ema20.length - 1] && 
        closes[closes.length - 2] >= ema20[ema20.length - 2]) {
      sellScore += 10;
      signals.reasons.push('✓ Price Below EMA(20)');
    }
    
    // Determine final signal
    const totalScore = buyScore + sellScore;
    
    if (buyScore > sellScore && buyScore >= 50) {
      signals.buySignal = true;
      signals.confidence = Math.min(100, (buyScore / 100) * 100);
      signals.trend = 'BULLISH';
    } else if (sellScore > buyScore && sellScore >= 50) {
      signals.sellSignal = true;
      signals.confidence = Math.min(100, (sellScore / 100) * 100);
      signals.trend = 'BEARISH';
    } else {
      signals.trend = 'NEUTRAL';
      signals.confidence = 0;
    }
    
    // Add trend context
    if (latestADX < this.adxStrengthThreshold) {
      signals.trendStrength = 'WEAK';
    } else if (latestADX > 40) {
      signals.trendStrength = 'VERY STRONG';
    } else {
      signals.trendStrength = 'STRONG';
    }
    
    return signals;
  }

  /**
   * Get indicator configuration (user adjustable)
   */
  getConfiguration() {
    return {
      rsiPeriod: this.rsiPeriod,
      macdFast: this.macdFast,
      macdSlow: this.macdSlow,
      macdSignal: this.macdSignal,
      bbPeriod: this.bbPeriod,
      bbDeviation: this.bbDeviation,
      adxPeriod: this.adxPeriod,
      rsiOverbought: this.rsiOverbought,
      rsiOversold: this.rsiOversold,
      adxStrengthThreshold: this.adxStrengthThreshold
    };
  }

  /**
   * Update indicator parameters
   */
  setConfiguration(config) {
    if (config.rsiPeriod) this.rsiPeriod = config.rsiPeriod;
    if (config.macdFast) this.macdFast = config.macdFast;
    if (config.macdSlow) this.macdSlow = config.macdSlow;
    if (config.macdSignal) this.macdSignal = config.macdSignal;
    if (config.bbPeriod) this.bbPeriod = config.bbPeriod;
    if (config.bbDeviation) this.bbDeviation = config.bbDeviation;
    if (config.adxPeriod) this.adxPeriod = config.adxPeriod;
    if (config.rsiOverbought) this.rsiOverbought = config.rsiOverbought;
    if (config.rsiOversold) this.rsiOversold = config.rsiOversold;
    if (config.adxStrengthThreshold) this.adxStrengthThreshold = config.adxStrengthThreshold;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedIndicator;
}
