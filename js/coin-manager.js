/**
 * Coin Management Module
 * Integrates custom coin creation with the market
 */

class CoinManager {
  constructor() {
    this.coins = [];
    this.apiBase = '/api/coins';
    this.socket = null;
  }

  /**
   * Initialize coin manager
   */
  async init(socketIo) {
    this.socket = socketIo;
    await this.loadCoins();
    this.setupWebSocket();
  }

  /**
   * Load all custom coins from backend
   */
  async loadCoins() {
    try {
      const response = await fetch(`${this.apiBase}`);
      const data = await response.json();
      this.coins = data.coins || [];
      console.log(`✅ Loaded ${this.coins.length} custom coins`);
      return this.coins;
    } catch (error) {
      console.error('Error loading coins:', error);
      return [];
    }
  }

  /**
   * Get coin by symbol
   */
  getCoin(symbol) {
    return this.coins.find(c => c.symbol === symbol.toUpperCase());
  }

  /**
   * Add coin to UI
   */
  addCoinToUI(coin, containerId = 'coins-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const coinCard = this.createCoinCard(coin);
    container.appendChild(coinCard);
  }

  /**
   * Create coin card element
   */
  createCoinCard(coin) {
    const card = document.createElement('div');
    card.className = 'coin-card';
    card.dataset.symbol = coin.symbol;

    const changeClass = coin.dayChange >= 0 ? 'positive' : 'negative';
    const changeSign = coin.dayChange >= 0 ? '+' : '';

    card.innerHTML = `
      <div class="coin-icon" style="background: linear-gradient(135deg, ${coin.color}, ${coin.color}dd);">
        ${coin.symbol.substring(0, 2)}
      </div>
      <div class="coin-info">
        <h3 class="coin-name">${coin.name}</h3>
        <p class="coin-symbol">${coin.symbol}</p>
        <p class="coin-price">$${parseFloat(coin.initialPrice).toFixed(2)}</p>
        <p class="coin-change ${changeClass}">
          ${changeSign}${parseFloat(coin.dayChange).toFixed(2)}%
        </p>
      </div>
    `;

    // Click to view details
    card.addEventListener('click', () => this.showCoinDetails(coin));

    return card;
  }

  /**
   * Show coin details modal
   */
  showCoinDetails(coin) {
    const details = `
📊 ${coin.name} (${coin.symbol})

💰 Price: $${parseFloat(coin.initialPrice).toFixed(2)}
📈 24h Change: ${parseFloat(coin.dayChange).toFixed(2)}%
💹 Market Cap: $${parseFloat(coin.marketCap || 0).toLocaleString()}
📦 Total Supply: ${parseFloat(coin.totalSupply || 0).toLocaleString()}
🔄 Circulating: ${parseFloat(coin.circulatingSupply || 0).toLocaleString()}
💹 24h Volume: $${parseFloat(coin.volume24h || 0).toLocaleString()}

🌐 ${coin.blockchain || 'N/A'}
${coin.contractAddress ? `📝 Contract: ${coin.contractAddress}` : ''}
${coin.website ? `🔗 Website: ${coin.website}` : ''}

📅 Created: ${new Date(coin.createdAt).toLocaleString()}

${coin.description ? `\n📝 About:\n${coin.description}` : ''}
    `;

    alert(details);
  }

  /**
   * Display all coins in grid
   */
  displayCoins(containerId = 'coins-container') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = '';

    if (this.coins.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p>📭 No custom coins yet</p>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            <a href="/create-coin.html">Create your first coin →</a>
          </p>
        </div>
      `;
      return;
    }

    this.coins.forEach(coin => {
      const coinCard = this.createCoinCard(coin);
      container.appendChild(coinCard);
    });
  }

  /**
   * Setup WebSocket listeners for real-time updates
   */
  setupWebSocket() {
    if (!this.socket) return;

    // Listen for new coins
    this.socket.on('coin:update', (data) => {
      const coin = this.getCoin(data.symbol);
      if (coin) {
        coin.initialPrice = data.price;
        coin.dayChange = data.dayChange;
        coin.volume24h = data.volume24h;
        this.updateCoinInUI(coin);
      }
    });

    // Listen for deleted coins
    this.socket.on('coin:deleted', (data) => {
      this.coins = this.coins.filter(c => c.symbol !== data.symbol);
      const element = document.querySelector(`[data-symbol="${data.symbol}"]`);
      if (element) element.remove();
    });
  }

  /**
   * Update coin in UI without reload
   */
  updateCoinInUI(coin) {
    const element = document.querySelector(`[data-symbol="${coin.symbol}"]`);
    if (!element) return;

    // Update price
    const priceEl = element.querySelector('.coin-price');
    if (priceEl) {
      priceEl.textContent = `$${parseFloat(coin.initialPrice).toFixed(2)}`;
    }

    // Update change
    const changeEl = element.querySelector('.coin-change');
    if (changeEl) {
      const changeClass = coin.dayChange >= 0 ? 'positive' : 'negative';
      const changeSign = coin.dayChange >= 0 ? '+' : '';
      changeEl.textContent = `${changeSign}${parseFloat(coin.dayChange).toFixed(2)}%`;
      changeEl.className = `coin-change ${changeClass}`;
    }

    // Subtle animation
    element.style.animation = 'pulse 0.5s ease-in-out';
  }

  /**
   * Search coins
   */
  searchCoins(query) {
    const q = query.toLowerCase();
    return this.coins.filter(coin =>
      coin.name.toLowerCase().includes(q) ||
      coin.symbol.toLowerCase().includes(q) ||
      coin.description?.toLowerCase().includes(q)
    );
  }

  /**
   * Sort coins
   */
  sortCoins(by = 'createdAt', order = 'desc') {
    const sorted = [...this.coins];

    sorted.sort((a, b) => {
      let aVal = a[by];
      let bVal = b[by];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }

  /**
   * Filter coins by blockchain
   */
  filterByBlockchain(blockchain) {
    return this.coins.filter(c => c.blockchain === blockchain);
  }

  /**
   * Get statistics
   */
  getStats() {
    if (this.coins.length === 0) {
      return {
        total: 0,
        avgPrice: 0,
        avgChange: 0,
        totalMarketCap: 0
      };
    }

    const prices = this.coins.map(c => parseFloat(c.initialPrice));
    const changes = this.coins.map(c => parseFloat(c.dayChange));
    const caps = this.coins.map(c => parseFloat(c.marketCap || 0));

    return {
      total: this.coins.length,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      totalMarketCap: caps.reduce((a, b) => a + b, 0),
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices)
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoinManager;
}

// =============================================
// USAGE EXAMPLES
// =============================================

/*
// In your market.html or app.js:

const coinManager = new CoinManager();
const socket = io(); // Your existing socket connection

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await coinManager.init(socket);
  
  // Display all coins
  coinManager.displayCoins('coins-container');
  
  // Get statistics
  console.log('Stats:', coinManager.getStats());
  
  // Search coins
  const results = coinManager.searchCoins('bitcoin');
  console.log('Search results:', results);
  
  // Filter by blockchain
  const ethereumCoins = coinManager.filterByBlockchain('ethereum');
  console.log('Ethereum coins:', ethereumCoins);
});

// Real-time updates are automatically handled by setupWebSocket()
*/
