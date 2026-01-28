// Market Page - Binance Style with Mini Charts
// OPTIMIZED: Improved performance with lazy loading, caching, and debouncing

/**
 * REFACTORED: Now uses Binance Live Charts (ApexCharts) exclusively in the Detail View.
 * TradingView Widgets have been removed from the Detail View logic.
 */

// Performance optimization: Cache DOM elements
const elementCache = {};
let miniCharts = {};
let mainChart = null;
let currentCoin = null;
let widgetsLoaded = false;
let resizeTimeout = null;

// Helper: Get element with caching
function getCachedElement(id) {
    if (!elementCache[id]) {
        elementCache[id] = document.getElementById(id);
    }
    return elementCache[id];
}

// Utility: Debounce function to limit repeated operations
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}

// Debounced resize handler
const debouncedResize = debounce(loadWidgetsWhenVisible, 250);

// Lazy load TradingView widgets only when visible
function loadWidgetsWhenVisible() {
    if (widgetsLoaded) return;
    
    const marketGrid = getCachedElement('market-grid');
    if (!marketGrid) return;
    
    const gridRect = marketGrid.getBoundingClientRect();
    
    // Check if grid is in viewport
    if (gridRect.top < window.innerHeight && gridRect.bottom > 0) {
        widgetsLoaded = true;
        loadTradingViewWidgets();
        window.removeEventListener('scroll', loadWidgetsWhenVisible);
        window.removeEventListener('resize', loadWidgetsWhenVisible);
    }
}

// Load TradingView widgets efficiently
function loadTradingViewWidgets() {
    cryptoCoins.forEach((coin, index) => {
        // Stagger widget loading to avoid overwhelming the browser
        setTimeout(() => {
            const widgetId = `tv-mini-chart-${coin.id}`;
            const container = getCachedElement(widgetId);
            if (!container || container.innerHTML) return;

            const isPositive = coin.change >= 0;
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbol": coin.binanceSymbol ? `BINANCE:${coin.binanceSymbol}` : `BINANCE:BTCUSDT`,
                "width": "100%",
                "height": "100%",
                "locale": "en",
                "dateRange": "1D",
                "colorTheme": "dark",
                "trendLineColor": isPositive ? "#10b981" : "#ef4444",
                "underLineColor": isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                "isTransparent": true,
                "autosize": true,
                "largeChartUrl": ""
            });
            container.appendChild(script);
        }, index * 50); // Stagger by 50ms per widget
    });
}

// Update market grid with TradingView mini charts (Kept for the grid view only)
function updateMarketGrid() {
    const marketGrid = getCachedElement('market-grid');
    if (!marketGrid) return;

    if (marketGrid.children.length > 0) {
        if (marketGrid.dataset.rendered === 'true') return;
    }

    marketGrid.innerHTML = cryptoCoins.map((coin) => {
        const isPositive = coin.change >= 0;
        const widgetId = `tv-mini-chart-${coin.id}`;

        return `
            <div class="market-coin-card" onclick="openCoinDetail(${coin.id})">
                <div class="market-coin-header">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <span class="market-coin-icon">${coin.icon}</span>
                        <div>
                            <h3 class="market-coin-name">${coin.name}</h3>
                            <p class="market-coin-symbol">${coin.symbol}</p>
                        </div>
                    </div>
                    <div class="market-coin-price-section">
                        <p class="market-coin-price">₹${coin.price.toFixed(2)}</p>
                        <p class="market-coin-change ${isPositive ? 'price-up' : 'price-down'}">
                            ${isPositive ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%
                        </p>
                    </div>
                </div>
                
                <div class="mini-chart-container" style="height: 120px;">
                    <div id="${widgetId}" class="mini-chart"></div>
                </div>
                
                <button class="market-buy-btn" onclick="event.stopPropagation(); openCoinDetail(${coin.id})">
                    Buy ${coin.symbol}
                </button>
            </div>
        `;
    }).join('');

    marketGrid.dataset.rendered = 'true';
    
    // Lazy load widgets when page scrolls into view
    window.addEventListener('scroll', loadWidgetsWhenVisible, { passive: true });
    window.addEventListener('resize', debouncedResize, { passive: true });
    loadWidgetsWhenVisible(); // Try immediate load
}

// Open coin detail modal
function openCoinDetail(coinId) {
    const coin = cryptoCoins.find(c => c.id === coinId);
    if (!coin) {
        return;
    }

    currentCoin = coin;

    // Batch DOM updates with cached elements
    const detailIcon = getCachedElement('detail-icon');
    const detailName = getCachedElement('detail-name');
    const detailSymbol = getCachedElement('detail-symbol');
    const detailPrice = getCachedElement('detail-price');
    const buySymbol = getCachedElement('buy-symbol');
    const changeElement = getCachedElement('detail-change');
    const modal = getCachedElement('coin-detail-modal');

    if (detailIcon) detailIcon.textContent = coin.icon;
    if (detailName) detailName.textContent = coin.name;
    if (detailSymbol) detailSymbol.textContent = coin.symbol;
    if (detailPrice) detailPrice.textContent = `₹${coin.price.toFixed(2)}`;
    if (buySymbol) buySymbol.textContent = coin.symbol;

    if (changeElement) {
        const isPositive = coin.change >= 0;
        changeElement.textContent = `${isPositive ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%`;
        changeElement.className = isPositive ? 'price-up' : 'price-down';
    }

    // Show modal
    if (modal) modal.classList.add('active');

    // Update buy section
    updateBuySection();

    // REMOVED: TradingView Chart Initialization
    // loadTradingViewChart(currentCoin.tvSymbol);
    // initTechnicalAnalysis(currentCoin.tvSymbol);

    // Initialize Cryptoverse Bot indicator (background logic)
    if (!marketAdvancedIndicator) {
        initCryptoverseBotIndicator();
    }

    // Initialize & Load Default Binance Chart (ApexCharts)
    // We force this every time to ensure fresh state
    initMarketIndicatorChart();

    // Reset indicator state (Bot starts Inactive, but Chart is Active)
    // We do NOT want to "deactivate" the chart, only the bot overlays.
    deactivateMarketIndicator();

    // Load the chart data immediately
    if (currentMarketChart) {
        let symbol = currentCoin.binanceSymbol || 'BTCUSDT';
        console.log(`📊 Opening Detail View for ${symbol}`);
        currentMarketChart.changeSymbol(symbol, '1h');
    }
}

// Close coin detail modal
function closeCoinDetail() {
    const modal = getCachedElement('coin-detail-modal');
    if (modal) modal.classList.remove('active');

    // Stop the bot logic
    deactivateMarketIndicator();

    // We can also disconnect the chart to save resources
    if (currentMarketChart) {
        currentMarketChart.disconnect();
    }

    if (currentCoin) {
        currentCoin = null;
    }
}


// Update buy section
async function updateBuySection() {
    const buyAmount = getCachedElement('buy-amount');
    const totalCost = getCachedElement('total-cost');
    const currentBalance = getCachedElement('current-balance');

    try {
        const remoteWallet = await getWallet();
        if (remoteWallet) {
            wallet = remoteWallet;
        }
    } catch (err) {
        console.error("Failed to sync wallet in market section", err);
    }

    if (currentBalance) {
        currentBalance.textContent = `₹${wallet.balance.toFixed(2)}`;
    }

    if (buyAmount && totalCost && currentCoin) {
        buyAmount.oninput = function () {
            const amount = parseFloat(this.value) || 0;
            const total = currentCoin.price * amount;
            totalCost.textContent = `Total: ₹${total.toFixed(2)}`;

            if (total > wallet.balance) {
                totalCost.style.color = '#ef4444';
            } else {
                totalCost.style.color = '#00d4ff';
            }
        };

        const amount = parseFloat(buyAmount.value) || 1;
        totalCost.textContent = `Total: ₹${(currentCoin.price * amount).toFixed(2)}`;
    }
}

// Handle buy button click
async function handleBuyClick() {
    if (!currentCoin) {
        alert('Please select a coin first!');
        return;
    }

    const buyAmountElement = getCachedElement('buy-amount');
    const paymentMethodElement = getCachedElement('payment-method');
    
    const amount = parseFloat(buyAmountElement?.value) || 0;
    const totalCost = currentCoin.price * amount;
    const paymentMethod = paymentMethodElement?.value || 'wallet';

    if (amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    if (paymentMethod === 'wallet') {
        try {
            await buyCrypto(currentCoin.symbol, amount, currentCoin.price, totalCost);
            alert(`✅ Purchase Successful!\n\n` +
                `Bought: ${amount.toFixed(4)} ${currentCoin.symbol}\n` +
                `Cost: ₹${totalCost.toFixed(2)}\n\n` +
                `✓ Check your wallet to view your coins!`);

            if (buyAmountElement) buyAmountElement.value = 1;
            await updateBuySection();
            closeCoinDetail();
        } catch (err) {
            alert(`❌ Purchase Failed: ${err.message}`);
        }
    }
    else if (paymentMethod === 'upi') {
        const upiProviders = ['Paytm', 'Google Pay', 'PhonePe'];
        const provider = upiProviders[Math.floor(Math.random() * upiProviders.length)];

        if (confirm(`Open ${provider} to pay ₹${totalCost.toFixed(2)}?`)) {
            alert(`📱 Opening ${provider}...`);
            setTimeout(async () => {
                await completePurchase(amount);
            }, 2000);
        }
    }
    else if (paymentMethod === 'card') {
        if (confirm(`Pay ₹${totalCost.toFixed(2)} with Card?`)) {
            alert('💳 Processing card payment...');
            setTimeout(async () => {
                await completePurchase(amount);
            }, 2000);
        }
    }
}

async function completePurchase(coinAmount) {
    try {
        const currentWallet = await getWallet();
        if (!currentWallet.coins[currentCoin.symbol]) currentWallet.coins[currentCoin.symbol] = 0;
        currentWallet.coins[currentCoin.symbol] += coinAmount;

        const transaction = {
            type: 'external_buy',
            coin: currentCoin.symbol,
            amount: coinAmount,
            price: currentCoin.price
        };

        await updateWalletApi(currentWallet.balance, currentWallet.coins, transaction);

        alert(`✅ Payment Successful!\n\n` +
            `${coinAmount.toFixed(4)} ${currentCoin.symbol} added to your wallet!\n\n` +
            `✓ Check your wallet to view your coins.`);

        const buyAmountElement = getCachedElement('buy-amount');
        if (buyAmountElement) buyAmountElement.value = 1;
        await updateBuySection();
        closeCoinDetail();
    } catch (err) {
        alert("Failed to complete purchase: " + err.message);
    }
}

// Initialize Ticker Tape Widget
function initTickerTape() {
    const container = getCachedElement('tv-ticker-tape');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "symbols": cryptoCoins.slice(0, 11).map(c => ({
            "proName": `BINANCE:${c.binanceSymbol}`,
            "title": c.name
        })),
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "adaptive",
        "locale": "en"
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize Market Overview Widget
function initMarketOverview() {
    const container = getCachedElement('tv-market-overview');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "rgba(106, 109, 120, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
            {
                "title": "Cryptocurrencies",
                "symbols": [
                    { "s": "BINANCE:BTCUSDT" },
                    { "s": "BINANCE:ETHUSDT" },
                    { "s": "BINANCE:SOLUSDT" },
                    { "s": "BINANCE:ADAUSDT" },
                    { "s": "BINANCE:DOGEUSDT" },
                    { "s": "BINANCE:XRPUSDT" },
                    { "s": "BINANCE:DOTUSDT" },
                    { "s": "BINANCE:AVAXUSDT" },
                    { "s": "BINANCE:LINKUSDT" },
                    { "s": "BINANCE:MATICUSDT" }
                ]
            }
        ]
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize Financial News Widget
function initFinancialNews() {
    const container = getCachedElement('tv-financial-news');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "feedMode": "all_symbols",
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": "100%",
        "locale": "en"
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize Crypto Screener Widget
function initCryptoScreener() {
    const container = getCachedElement('tv-crypto-screener');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "defaultColumn": "overview",
        "screener_type": "crypto_mkt",
        "displayMode": "adaptive",
        "locale": "en",
        "colorTheme": "dark"
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize market page
if (window.location.pathname.includes('market.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        // Initialize TradingView Widgets (Grid/Header Only)
        setTimeout(() => {
            initTickerTape();
            initMarketOverview();
            initFinancialNews();
            initCryptoScreener();
        }, 1000);

        updateMarketGrid();

        const buyBtn = getCachedElement('buy-btn-modal');
        if (buyBtn && !buyBtn.hasListener) {
            buyBtn.addEventListener('click', handleBuyClick);
            buyBtn.hasListener = true;
        }
    });
}

// Fullscreen logic
function toggleFullScreen(elementId) {
    const element = getCachedElement(elementId);
    if (!element) return;

    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        element.style.padding = "20px";
        element.style.background = "#050816";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        element.style.padding = "";
        element.style.background = "";
    }
}

window.addEventListener('click', (event) => {
    const modal = getCachedElement('coin-detail-modal');
    if (event.target === modal) {
        closeCoinDetail();
    }
});

/* ========== CRYPTOVERSE BOT INDICATOR SYSTEM (REAL-TIME PERMANENT) ========== */

let marketIndicatorActive = false;
let marketBotDisplayVisible = false;
let marketIndicatorRenderer = null;
let marketAdvancedIndicator = null;
let marketIndicatorCheckInterval = null;
let currentMarketChart = null;

// Initialize Cryptoverse Bot Indicator
function initCryptoverseBotIndicator() {
    if (typeof AdvancedIndicator !== 'undefined' && !marketAdvancedIndicator) {
        marketAdvancedIndicator = new AdvancedIndicator();
        console.log('✅ Cryptoverse Bot (Advanced Indicator) initialized');
    }
}

function toggleMarketIndicator() {
    if (!marketIndicatorActive) {
        activateMarketIndicator();
    } else {
        deactivateMarketIndicator();
    }
}

// Initialize the Binance Chart (CryptoChart)
function initMarketIndicatorChart() {
    const chartContainerName = 'market-indicator-chart-container';

    // Initialize CryptoChart if not exists
    if (!currentMarketChart) {
        console.log("🚀 Initializing Real-Time CryptoChart for Market Page...");
        currentMarketChart = new CryptoChart(chartContainerName);
        currentMarketChart.initChart();

        // Initialize Renderer on this new chart
        marketIndicatorRenderer = new IndicatorRenderer(currentMarketChart);
    }
}

// ACTIVATE BOT: Turns ON Indicators/Signals (Chart is ALREADY visible)
function activateMarketIndicator() {
    if (!currentCoin) return;

    if (!marketAdvancedIndicator) {
        initCryptoverseBotIndicator();
    }

    marketIndicatorActive = true;
    marketBotDisplayVisible = true;

    // Batch UI Updates with cached elements
    const btn = getCachedElement('market-indicator-btn');
    const statusText = getCachedElement('market-bot-status-text');
    const panel = getCachedElement('market-indicator-panel');
    const displayBtn = getCachedElement('market-display-btn');

    if (btn) {
        btn.classList.add('active');
        btn.textContent = '🤖 Cryptoverse Bot Active';
    }
    if (statusText) {
        statusText.innerHTML = '<strong style="color: #00ff00;">🟢 Active - Analyzing ' + currentCoin.symbol + '</strong>';
    }
    if (panel) {
        panel.style.display = 'block';
    }
    if (displayBtn) {
        displayBtn.style.display = 'inline-block';
    }

    console.log(`📊 Bot Activated for ${currentCoin.symbol}`);

    // Update Bot logic immediately
    updateMarketBotChart();

    // Start Monitoring loop
    startMarketBotMonitoring();

    // Notification
    if (typeof tradingNotifications !== 'undefined') {
        tradingNotifications.showDesktopNotification(
            '🤖 Cryptoverse Bot Activated',
            { body: `Analyzing ${currentCoin.name} (${currentCoin.symbol}) with Real-Time Data` }
        );
    }
}

// DEACTIVATE BOT: Turns OFF Indicators (Chart REMAINS visible)
function deactivateMarketIndicator() {
    marketIndicatorActive = false;
    marketBotDisplayVisible = false;

    if (marketIndicatorCheckInterval) {
        clearInterval(marketIndicatorCheckInterval);
        marketIndicatorCheckInterval = null;
    }

    // Batch UI Updates with cached elements
    const btn = getCachedElement('market-indicator-btn');
    const statusText = getCachedElement('market-bot-status-text');
    const panel = getCachedElement('market-indicator-panel');
    const displayBtn = getCachedElement('market-display-btn');

    if (btn) {
        btn.classList.remove('active');
        btn.textContent = '🤖 Activate Cryptoverse Bot';
    }
    if (statusText) {
        statusText.innerHTML = '<strong style="color: #a0a0a0;">⚫ Inactive</strong>';
    }
    if (panel) {
        panel.style.display = 'none';
    }
    if (displayBtn) {
        displayBtn.style.display = 'none';
    }

    // Clear Indicators (But keep the chart!)
    if (marketIndicatorRenderer) {
        marketIndicatorRenderer.clearIndicators();
    }
}

function toggleMarketBotDisplay() {
    marketBotDisplayVisible = !marketBotDisplayVisible;
    const btn = getCachedElement('market-display-btn');

    if (marketBotDisplayVisible) {
        if (btn) btn.textContent = '👁️ Hide View';
        updateMarketBotChart();
    } else {
        if (btn) btn.textContent = '👁️ Show View';
        if (marketIndicatorRenderer) {
            marketIndicatorRenderer.clearIndicators();
        }
    }
}

function startMarketBotMonitoring() {
    // Check every 2 seconds (Real-Time)
    marketIndicatorCheckInterval = setInterval(() => {
        if (marketIndicatorActive && currentCoin) {
            updateMarketBotChart();
        }
    }, 2000);
}

// Core Analysis Loop
function updateMarketBotChart() {
    if (!marketIndicatorActive || !currentMarketChart || !marketIndicatorRenderer) return;

    // Use Real Data from ChartHandler
    const candles = currentMarketChart.candlesData;

    if (!candles || candles.length < 20) {
        return;
    }

    // Generate Signals
    const signals = marketAdvancedIndicator.generateSignals(candles);

    if (signals) {
        // Draw Indicators & Markers on Real Chart
        if (marketBotDisplayVisible) {
            marketIndicatorRenderer.renderIndicators(candles, marketAdvancedIndicator);

            // Add Marker if Signal
            if (signals.buySignal || signals.sellSignal) {
                const lastCandle = candles[candles.length - 1];
                marketIndicatorRenderer.addSignalMarker(signals, lastCandle);
            }
        }

        // Update Status Panel
        updateBotStatusPanel(signals);
    }
}

function updateBotStatusPanel(signals) {
    const statusText = getCachedElement('market-bot-status-text');
    if (!statusText || !marketBotDisplayVisible) return;

    let signalEmoji = '➡️';
    let signalColor = '#a0a0a0';
    let signalText = 'HOLD';

    if (signals.buySignal) {
        signalEmoji = '▲';
        signalColor = '#00ff00';
        signalText = 'BUY';
    } else if (signals.sellSignal) {
        signalEmoji = '▼';
        signalColor = '#ff6600';
        signalText = 'SELL';
    }

    statusText.innerHTML = `<strong style="color: ${signalColor};">${signalEmoji} ${signalText} | ${signals.trend} | ${signals.confidence.toFixed(0)}% Confidence</strong>`;

    let reasonsHtml = '<div style="font-size: 0.8rem; color: #a0a0a0; margin-top: 0.5rem;">';
    if (signals.reasons && signals.reasons.length > 0) {
        reasonsHtml += signals.reasons.slice(0, 3).join('<br>'); // Top 3 reasons
    }
    reasonsHtml += '</div>';
    statusText.innerHTML += reasonsHtml;
}
