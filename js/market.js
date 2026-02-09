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
    return function (...args) {
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

// Lazy load Binance widgets only when visible
function loadWidgetsWhenVisible() {
    if (widgetsLoaded) return;

    const marketGrid = getCachedElement('market-grid');
    if (!marketGrid) return;

    const gridRect = marketGrid.getBoundingClientRect();

    // Check if grid is in viewport
    if (gridRect.top < window.innerHeight && gridRect.bottom > 0) {
        widgetsLoaded = true;
        initBinanceSparklines();
        window.removeEventListener('scroll', loadWidgetsWhenVisible);
        window.removeEventListener('resize', loadWidgetsWhenVisible);
    }
}

// Load Binance Sparklines efficiently
async function initBinanceSparklines() {
    for (let i = 0; i < cryptoCoins.length; i++) {
        const coin = cryptoCoins[i];
        const widgetId = `binance-sparkline-${coin.id}`;
        const container = getCachedElement(widgetId);

        if (!container) continue;

        try {
            // Fetch last 24 1h candles for sparkline
            const symbol = coin.binanceSymbol || 'BTCUSDT';
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
            const data = await response.json();

            const prices = data.map(d => parseFloat(d[4])); // Close prices
            const isPositive = prices[prices.length - 1] >= prices[0];

            renderSparkline(widgetId, prices, isPositive ? "#10b981" : "#ef4444");
        } catch (error) {
            console.error(`Error loading sparkline for ${coin.symbol}:`, error);
        }
    }
}

function renderSparkline(containerId, data, color) {
    const isPositive = color === "#10b981" || color === "#089981";
    const lineId = `spark-${containerId}`;

    const options = {
        series: [{
            name: 'Price',
            data: data
        }],
        chart: {
            id: lineId,
            type: 'area',
            height: 120,
            sparkline: {
                enabled: true
            },
            animations: {
                enabled: true,
                speed: 800
            },
            background: 'transparent'
        },
        stroke: {
            curve: 'smooth',
            width: 2,
            colors: [isPositive ? '#089981' : '#f23645']
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100],
                colorStops: [
                    {
                        offset: 0,
                        color: isPositive ? '#089981' : '#f23645',
                        opacity: 0.4
                    },
                    {
                        offset: 100,
                        color: isPositive ? '#089981' : '#f23645',
                        opacity: 0
                    }
                ]
            }
        },
        colors: [isPositive ? '#089981' : '#f23645'],
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function () {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };

    const container = document.querySelector(`#${containerId}`);
    if (container) {
        container.innerHTML = ''; // Clear previous
        const chart = new ApexCharts(container, options);
        chart.render();
    }
}

// Update market grid with Binance Sparklines
function updateMarketGrid() {
    const marketGrid = getCachedElement('market-grid');
    if (!marketGrid) return;

    if (marketGrid.children.length > 0) {
        if (marketGrid.dataset.rendered === 'true') return;
    }

    marketGrid.innerHTML = cryptoCoins.map((coin) => {
        const isPositive = coin.change >= 0;
        const widgetId = `binance-sparkline-${coin.id}`;

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

    // Lazy load sparklines when page scrolls into view
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

// Initialize Binance Ticker Tape (Custom scrolling ticker)
async function initBinanceTickerTape() {
    const container = getCachedElement('binance-ticker-tape');
    if (!container) return;

    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();

        // Filter for our main coins
        const mainSymbols = cryptoCoins.map(c => c.binanceSymbol);
        const tickers = data.filter(t => mainSymbols.includes(t.symbol));

        container.style.overflow = 'hidden';
        container.style.whiteSpace = 'nowrap';
        container.style.background = 'rgba(10, 14, 39, 0.8)';
        container.style.padding = '10px 0';
        container.style.borderBottom = '1px solid rgba(0, 212, 255, 0.2)';

        let tickerHtml = '<div class="ticker-content" style="display: inline-block; animation: ticker-scroll 60s linear infinite;">';

        // Triple the content to ensure smooth looping
        for (let i = 0; i < 3; i++) {
            tickers.forEach(t => {
                const coin = cryptoCoins.find(c => c.binanceSymbol === t.symbol);
                const isPos = parseFloat(t.priceChangePercent) >= 0;
                tickerHtml += `
                    <span style="display: inline-block; margin-right: 50px; font-weight: bold; font-family: 'Inter', sans-serif;">
                        <span style="color: #00d4ff;">${coin ? coin.name : t.symbol}</span> 
                        <span style="color: #ffffff; margin: 0 5px;">₹${(parseFloat(t.lastPrice) * 85).toFixed(2)}</span>
                        <span style="color: ${isPos ? '#10b981' : '#ef4444'};">${isPos ? '▲' : '▼'} ${parseFloat(t.priceChangePercent).toFixed(2)}%</span>
                    </span>
                `;
            });
        }
        tickerHtml += '</div>';

        container.innerHTML = `
            <style>
                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
            </style>
            ${tickerHtml}
        `;
    } catch (err) {
        console.error("Error loading ticker tape:", err);
    }
}

// Initialize Binance Market Overview (Large ApexChart + Summary)
async function initMarketOverview() {
    const container = getCachedElement('binance-market-overview');
    if (!container) return;

    // Show a large BTCUSDT chart as market overview
    try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=50');
        const data = await response.json();
        const prices = data.map(d => ({
            x: new Date(d[0]),
            y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])]
        }));

        const options = {
            series: [{
                name: 'Bitcoin (BTC/USDT)',
                data: prices
            }],
            chart: {
                type: 'candlestick',
                height: 600,
                background: 'transparent',
                toolbar: { show: false }
            },
            theme: { mode: 'dark' },
            xaxis: { type: 'datetime' },
            yaxis: { tooltip: { enabled: true } },
            grid: { borderColor: 'rgba(0, 212, 255, 0.1)' }
        };

        container.innerHTML = '';
        const chart = new ApexCharts(container, options);
        chart.render();
    } catch (err) {
        console.error("Error loading overview:", err);
    }
}

// Initialize Binance Intelligence News
function initFinancialNews() {
    const container = getCachedElement('binance-financial-news');
    if (!container) return;

    const news = [
        { title: "Standard Chartered Predicts Bitcoin Could Hit $200k by Year-End", time: "2h ago", source: "Binance Feed" },
        { title: "Ethereum Layer 2 Activity Hits Record High Amid Low Fees", time: "4h ago", source: "Cryptoverse Intelligence" },
        { title: "Solana Transaction Volume Surpasses Ethereum in Peak Hours", time: "6h ago", source: "Market Watch" },
        { title: "Global Crypto Adoption Statistics Show 34% Growth in Asia", time: "8h ago", source: "Binance Research" },
        { title: "Top 10 Cryptocurrencies to Watch This Week - CryptoVerse Analyst", time: "10h ago", source: "Exclusive" },
        { title: "New Regulatory Framework for Digital Assets Proposed in Europe", time: "12h ago", source: "Policy News" },
        { title: "SEC Approves Spot Ether ETFs, Trading Expected to Start Soon", time: "14h ago", source: "Breaking" }
    ];

    let newsHtml = '<div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 10px;">';
    news.forEach(item => {
        newsHtml += `
            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
                <p style="color: #66B2FF; font-size: 0.8rem; margin-bottom: 0.3rem;">${item.source} • ${item.time}</p>
                <h4 style="color: #ffffff; cursor: pointer; transition: 0.3s;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='#ffffff'">${item.title}</h4>
            </div>
        `;
    });
    newsHtml += '</div>';

    container.innerHTML = newsHtml;
}

// Initialize Binance Market Screener
async function initCryptoScreener() {
    const container = getCachedElement('binance-market-screener');
    if (!container) return;

    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();

        // Take top 15 by volume
        const topVolume = data
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 15);

        let tableHtml = `
            <table style="width: 100%; color: white; border-collapse: collapse; font-family: 'Inter', sans-serif;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid rgba(0, 212, 255, 0.3);">
                        <th style="padding: 15px;">Symbol</th>
                        <th style="padding: 15px;">Price</th>
                        <th style="padding: 15px;">24h Change</th>
                        <th style="padding: 15px;">24h Volume</th>
                    </tr>
                </thead>
                <tbody>
        `;

        topVolume.forEach(t => {
            const isPos = parseFloat(t.priceChangePercent) >= 0;
            tableHtml += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onmouseover="this.style.background='rgba(0, 212, 255, 0.05)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px; font-weight: bold;">${t.symbol}</td>
                    <td style="padding: 15px;">$${parseFloat(t.lastPrice).toLocaleString()}</td>
                    <td style="padding: 15px; color: ${isPos ? '#10b981' : '#ef4444'};">${isPos ? '+' : ''}${parseFloat(t.priceChangePercent).toFixed(2)}%</td>
                    <td style="padding: 15px; color: #a0a0a0;">$${Math.round(parseFloat(t.quoteVolume)).toLocaleString()}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.style.overflowY = 'auto';
        container.innerHTML = tableHtml;
    } catch (err) {
        console.error("Error loading screener:", err);
    }
}

// Initialize market page
if (window.location.pathname.includes('market.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        // Initialize Binance Widgets
        setTimeout(() => {
            initBinanceTickerTape();
            initMarketOverview();
            initFinancialNews();
            initCryptoScreener();
        }, 500);

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
