/**
 * Advanced Notification System for Trading Signals
 * Provides advance alerts for buy/sell signals with sound and visual notifications
 */

class TradingNotificationSystem {
  constructor() {
    this.notifications = [];
    this.soundEnabled = true;
    this.desktopNotificationsEnabled = true;
    this.notificationHistory = [];
    this.requestPermission();
  }

  /**
   * Request desktop notification permission
   */
  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Create audio context for notification sound
   */
  playNotificationSound(type = 'buy') {
    if (!this.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;

      // Different frequencies for buy (high) and sell (low)
      const frequency = type === 'buy' ? 800 : 400;
      const duration = 0.5;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (e) {
      console.log('Audio notification unavailable:', e.message);
    }
  }

  /**
   * Show browser desktop notification
   */
  showDesktopNotification(title, options = {}) {
    if (!this.desktopNotificationsEnabled || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300d4ff"/><text x="50" y="60" font-size="60" fill="white" text-anchor="middle" font-weight="bold">₿</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300d4ff"/></svg>',
        ...options
      });
    }
  }

  /**
   * Create in-app visual notification
   */
  createVisualNotification(signal, candle, indicators) {
    const notification = {
      id: Date.now(),
      timestamp: new Date(),
      type: signal.buySignal ? 'BUY' : 'SELL',
      confidence: signal.confidence,
      trend: signal.trend,
      trendStrength: signal.trendStrength,
      reasons: signal.reasons,
      price: candle.close,
      candle: candle
    };

    this.notificationHistory.push(notification);

    // Create notification element
    const container = document.getElementById('notifications-container');
    if (container) {
      const notifElement = this.createNotificationElement(notification);
      container.appendChild(notifElement);

      // Auto-remove after 8 seconds
      setTimeout(() => {
        if (notifElement.parentNode) {
          notifElement.remove();
        }
      }, 8000);
    }

    return notification;
  }

  /**
   * Create HTML notification element
   */
  createNotificationElement(notification) {
    const div = document.createElement('div');
    const bgColor = notification.type === 'BUY' ? '#00d4ff' : '#ff4444';
    const bgColorDark = notification.type === 'BUY' ? '#0099cc' : '#cc0000';

    div.className = `trading-notification ${notification.type.toLowerCase()}`;
    div.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, ${bgColor} 0%, ${bgColorDark} 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
      min-width: 300px;
      max-width: 400px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      border: 1px solid rgba(255,255,255,0.2);
    `;

    const confidenceBar = Math.round(notification.confidence);
    const confidenceColor = confidenceBar >= 75 ? '#00ff00' : confidenceBar >= 50 ? '#ffaa00' : '#ff6600';

    let reasonsList = '';
    notification.reasons.forEach(reason => {
      reasonsList += `<li style="margin: 4px 0; font-size: 12px;">${reason}</li>`;
    });

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: bold;">
          ${notification.type === 'BUY' ? '🚀 BUY SIGNAL' : '⛔ SELL SIGNAL'}
        </h3>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
      </div>
      
      <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.9);">
          <strong>Price:</strong> $${notification.price.toFixed(2)}
        </p>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.9);">
          <strong>Trend:</strong> ${notification.trend} (${notification.trendStrength})
        </p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.9);">
          <strong>Confidence:</strong> <span style="color: ${confidenceColor};">${confidenceBar}%</span>
        </p>
      </div>
      
      <div style="background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">Signal Reasons:</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: rgba(255,255,255,0.95);">
          ${reasonsList}
        </ul>
      </div>
      
      <div style="display: flex; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.8);">
        <span>⏰ ${notification.timestamp.toLocaleTimeString()}</span>
      </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    if (!document.getElementById('notification-animations')) {
      style.id = 'notification-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return div;
  }

  /**
   * Send comprehensive alert
   */
  sendAlert(signal, candle) {
    // Play sound
    this.playNotificationSound(signal.buySignal ? 'buy' : 'sell');

    // Create visual notification
    const notification = this.createVisualNotification(signal, candle, null);

    // Send desktop notification
    const title = signal.buySignal ?
      `🚀 BUY Signal - ${signal.confidence.toFixed(0)}% Confidence` :
      `⛔ SELL Signal - ${signal.confidence.toFixed(0)}% Confidence`;

    const body = signal.reasons.slice(0, 2).join('\n');

    this.showDesktopNotification(title, {
      body: body,
      tag: 'trading-signal',
      requireInteraction: signal.confidence > 75
    });

    // Log to console
    console.log(`%c${signal.buySignal ? 'BUY' : 'SELL'} Signal Generated`,
      `color: ${signal.buySignal ? '#00ff00' : '#ff0000'}; font-size: 14px; font-weight: bold;`,
      signal);

    return notification;
  }

  /**
   * Toggle notifications
   */
  toggleNotifications(enabled) {
    this.desktopNotificationsEnabled = enabled;
  }

  /**
   * Toggle sound
   */
  toggleSound(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Get notification history
   */
  getHistory(limit = 10) {
    return this.notificationHistory.slice(-limit);
  }

  /**
   * Clear notification history
   */
  clearHistory() {
    this.notificationHistory = [];
  }
}

// Create global instance
const tradingNotifications = new TradingNotificationSystem();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TradingNotificationSystem;
}
