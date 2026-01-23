// Market Page - Binance Style with Mini Charts

let miniCharts = {};
let mainChart = null;
let currentCoin = null;

// Update market grid with TradingView mini charts
function updateMarketGrid() {
    const marketGrid = document.getElementById('market-grid');
    if (!marketGrid) return;

    // We only want to render the grid once to avoid flickering widgets
    if (marketGrid.children.length > 0) {
        // Just update prices in existing cards if needed, but for now we'll stick to a clean render
        // Actually, TradingView widgets shouldn't be re-rendered frequently.
        // If the grid is already full, we might just want to return.
        // But for simplicity in this demo, we'll render once and keep it.
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

    // Create TradingView mini charts after DOM update
    setTimeout(() => {
        cryptoCoins.forEach(coin => {
            const widgetId = `tv-mini-chart-${coin.id}`;
            const container = document.getElementById(widgetId);
            if (!container) return;

            const isPositive = coin.change >= 0;
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbol": coin.tvSymbol,
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
        });
    }, 500);
}

// Open coin detail modal
function openCoinDetail(coinId) {
    const coin = cryptoCoins.find(c => c.id === coinId);
    if (!coin) {
        return;
    }

    currentCoin = coin;

    // Update modal content
    document.getElementById('detail-icon').textContent = coin.icon;
    document.getElementById('detail-name').textContent = coin.name;
    document.getElementById('detail-symbol').textContent = coin.symbol;
    document.getElementById('detail-price').textContent = `₹${coin.price.toFixed(2)}`;
    document.getElementById('buy-symbol').textContent = coin.symbol;

    const changeElement = document.getElementById('detail-change');
    const isPositive = coin.change >= 0;
    changeElement.textContent = `${isPositive ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%`;
    changeElement.className = isPositive ? 'price-up' : 'price-down';

    // Show modal
    document.getElementById('coin-detail-modal').classList.add('active');

    // Update buy section
    updateBuySection();

    // Create charts
    loadTradingViewChart(currentCoin.tvSymbol);
    initTechnicalAnalysis(currentCoin.tvSymbol);
}

// Close coin detail modal
function closeCoinDetail() {
    document.getElementById('coin-detail-modal').classList.remove('active');
    if (currentCoin) {
        currentCoin = null;
    }
}

// Load TradingView Widget
function loadTradingViewChart(symbol) {
    if (typeof TradingView === 'undefined') return;

    // Default to BINANCE:BTCUSDT if no symbol provided
    const tvSymbol = symbol || 'BINANCE:BTCUSDT';

    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": tvSymbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1", // 1 = Candles
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "tv_chart_container"
    });
}

// Update buy section
async function updateBuySection() {
    const buyAmount = document.getElementById('buy-amount');
    const totalCost = document.getElementById('total-cost');
    const currentBalance = document.getElementById('current-balance');

    // Load latest wallet data from backend
    try {
        const remoteWallet = await getWallet();
        if (remoteWallet) {
            wallet = remoteWallet;
        }
    } catch (err) {
        console.error("Failed to sync wallet in market section", err);
    }

    // Update current balance
    if (currentBalance) {
        currentBalance.textContent = `₹${wallet.balance.toFixed(2)}`;
    }

    if (buyAmount && totalCost && currentCoin) {
        // Update total on input
        buyAmount.oninput = function () {
            const amount = parseFloat(this.value) || 0;
            const total = currentCoin.price * amount;
            totalCost.textContent = `Total: ₹${total.toFixed(2)}`;

            // Change color based on affordability
            if (total > wallet.balance) {
                totalCost.style.color = '#ef4444';
            } else {
                totalCost.style.color = '#00d4ff';
            }
        };

        // Initial calculation
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

    const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
    const totalCost = currentCoin.price * amount;
    const paymentMethod = document.getElementById('payment-method')?.value || 'wallet';

    if (amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    // If using wallet balance
    if (paymentMethod === 'wallet') {
        try {
            await buyCrypto(currentCoin.symbol, amount, currentCoin.price, totalCost);
            alert(`✅ Purchase Successful!\n\n` +
                `Bought: ${amount.toFixed(4)} ${currentCoin.symbol}\n` +
                `Cost: ₹${totalCost.toFixed(2)}\n\n` +
                `✓ Check your wallet to view your coins!`);

            // Reset and close
            document.getElementById('buy-amount').value = 1;
            await updateBuySection();
            closeCoinDetail();
        } catch (err) {
            alert(`❌ Purchase Failed: ${err.message}`);
        }
    }
    // If using UPI
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
    // If using Card
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

        document.getElementById('buy-amount').value = 1;
        await updateBuySection();
        closeCoinDetail();
    } catch (err) {
        alert("Failed to complete purchase: " + err.message);
    }
}

// Initialize Ticker Tape Widget
function initTickerTape() {
    const container = document.getElementById('tv-ticker-tape');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "symbols": cryptoCoins.slice(0, 15).map(c => ({
            "proName": c.tvSymbol,
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
    const container = document.getElementById('tv-market-overview');
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
                "title": "Crypto",
                "symbols": [
                    { "s": "BINANCE:BTCUSDT" },
                    { "s": "BINANCE:ETHUSDT" },
                    { "s": "BINANCE:SOLUSDT" },
                    { "s": "BINANCE:ADAUSDT" },
                    { "s": "BINANCE:DOGEUSDT" }
                ]
            },
            {
                "title": "Forex",
                "symbols": [
                    { "s": "FX:EURUSD" },
                    { "s": "FX:GBPUSD" },
                    { "s": "FX:USDJPY" },
                    { "s": "FX:AUDUSD" },
                    { "s": "FX:USDCAD" }
                ]
            },
            {
                "title": "Commodities",
                "symbols": [
                    { "s": "OANDA:XAUUSD", "d": "Gold" },
                    { "s": "OANDA:XAGUSD", "d": "Silver" },
                    { "s": "TVC:USOIL", "d": "Crude Oil" }
                ]
            }
        ]
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize Technical Analysis Widget
function initTechnicalAnalysis(symbol) {
    const container = document.getElementById('tv_technical_analysis');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "interval": "1D",
        "width": "100%",
        "isTransparent": true,
        "height": "100%",
        "symbol": symbol,
        "showIntervalTabs": true,
        "locale": "en",
        "colorTheme": "dark"
    });
    container.innerHTML = '';
    container.appendChild(script);
}

// Initialize Financial News Widget
function initFinancialNews() {
    const container = document.getElementById('tv-financial-news');
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
    const container = document.getElementById('tv-crypto-screener');
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
        // Initialize TradingView Widgets
        setTimeout(() => {
            initTickerTape();
            initMarketOverview();
            initFinancialNews();
            initCryptoScreener();
        }, 1000); // Give script time to load

        // Initial load
        updateMarketGrid();

        // Attach buy button handler
        const buyBtn = document.getElementById('buy-btn-modal');
        if (buyBtn) {
            buyBtn.addEventListener('click', handleBuyClick);
        }
    });
}

// Fullscreen logic
function toggleFullScreen(elementId) {
    const element = document.getElementById(elementId);
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

// Close modal on outside click
window.addEventListener('click', (event) => {
    const modal = document.getElementById('coin-detail-modal');
    if (event.target === modal) {
        closeCoinDetail();
    }
});