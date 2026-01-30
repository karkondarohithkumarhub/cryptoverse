// Crypto coins data (Prices in INR)
const CURRENCY_RATE = 84; // 1 USD = 84 INR
const CURRENCY_SYMBOL = '₹';
const BINANCE_API = 'https://api.binance.com/api/v3';

let cryptoCoins = [
    // --- Crypto ---
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 45000 * CURRENCY_RATE, change: 2.5, icon: '₿', binanceSymbol: 'BTCUSDT' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3200 * CURRENCY_RATE, change: -1.2, icon: 'Ξ', binanceSymbol: 'ETHUSDT' },
    { id: 3, name: 'Cardano', symbol: 'ADA', price: 1.5 * CURRENCY_RATE, change: 3.8, icon: '₳', binanceSymbol: 'ADAUSDT' },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 120 * CURRENCY_RATE, change: 5.2, icon: '◎', binanceSymbol: 'SOLUSDT' },
    { id: 5, name: 'Polkadot', symbol: 'DOT', price: 28 * CURRENCY_RATE, change: -2.1, icon: '●', binanceSymbol: 'DOTUSDT' },
    { id: 6, name: 'Ripple', symbol: 'XRP', price: 0.85 * CURRENCY_RATE, change: 1.5, icon: '✕', binanceSymbol: 'XRPUSDT' },
    { id: 7, name: 'Dogecoin', symbol: 'DOGE', price: 0.15 * CURRENCY_RATE, change: 8.3, icon: 'Ð', binanceSymbol: 'DOGEUSDT' },
    { id: 8, name: 'Avalanche', symbol: 'AVAX', price: 95 * CURRENCY_RATE, change: -0.8, icon: '▲', binanceSymbol: 'AVAXUSDT' },
    { id: 13, name: 'Chainlink', symbol: 'LINK', price: 18 * CURRENCY_RATE, change: 2.1, icon: '🔗', binanceSymbol: 'LINKUSDT' },
    { id: 14, name: 'Polygon', symbol: 'MATIC', price: 0.9 * CURRENCY_RATE, change: -1.5, icon: '💜', binanceSymbol: 'MATICUSDT' },
    { id: 15, name: 'Shiba Inu', symbol: 'SHIB', price: 0.00001 * CURRENCY_RATE, change: 4.5, icon: '🐕', binanceSymbol: 'SHIBUSDT' },
];

// Wait for DOM to be ready
function initializeApp() {
    // Fetch real-time Binance data for cryptocurrencies
    fetchBinanceData();
    
    // Update prices every 5 seconds from Binance API
    setInterval(() => {
        fetchBinanceData();
    }, 5000);

    // ===== AUTH PAGE =====
    setupAuthPage();
}

// Fetch real-time cryptocurrency data from Binance API
async function fetchBinanceData() {
    try {
        // Get 24h ticker data for top cryptocurrencies
        const symbols = cryptoCoins
            .filter(coin => coin.binanceSymbol)
            .map(coin => coin.binanceSymbol);
        
        if (symbols.length === 0) return;

        // Fetch ticker data from Binance
        const response = await fetch(`${BINANCE_API}/ticker/24hr?symbols=["${symbols.join('","')}"]`);
        if (!response.ok) throw new Error('Binance API error');
        
        const data = await response.json();
        
        // Update cryptoCoins with real Binance data
        data.forEach(ticker => {
            const coin = cryptoCoins.find(c => c.binanceSymbol === ticker.symbol);
            if (coin) {
                const lastPrice = parseFloat(ticker.lastPrice);
                const priceChangePercent = parseFloat(ticker.priceChangePercent);
                
                // Update coin with real data
                coin.price = lastPrice * CURRENCY_RATE;
                coin.change = priceChangePercent;
                coin.high = parseFloat(ticker.highPrice) * CURRENCY_RATE;
                coin.low = parseFloat(ticker.lowPrice) * CURRENCY_RATE;
                coin.volume = parseFloat(ticker.volume);
                coin.quoteAssetVolume = parseFloat(ticker.quoteAssetVolume);
            }
        });

        // Update UI
        updateMarketList();
        updateTradeGrid();
    } catch (error) {
        console.warn('⚠️ Binance API fetch failed, using cached data:', error.message);
        // Fallback to simulated updates if API fails
        simulatePriceUpdates();
    }
}

// Fallback: Simulate price updates when API is unavailable
function simulatePriceUpdates() {
    cryptoCoins = cryptoCoins.map(coin => {
        if (coin.binanceSymbol) {
            return {
                ...coin,
                price: coin.price * (1 + (Math.random() - 0.5) * 0.02),
                change: coin.change + (Math.random() - 0.5) * 0.5
            };
        }
        return coin;
    });
    updateMarketList();
    updateTradeGrid();
}

function setupAuthPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        return;
    }
    
    const signupForm = document.getElementById('signup-form');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    const authTitle = document.getElementById('auth-title');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm.style.display !== 'none') {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                authTitle.textContent = 'Create Account';
                toggleText.textContent = 'Already have an account?';
                toggleBtn.textContent = 'Login';
            } else {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                authTitle.textContent = 'Welcome Back';
                toggleText.textContent = "Don't have an account?";
                toggleBtn.textContent = 'Sign Up';
            }
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (username) {
            try {
                console.log('Attempting login with:', username);
                await loginUser(username, password);
                console.log('Login successful, redirecting...');
                 localStorage.setItem('username', username);
                window.location.href = 'home.html';
            } catch (err) {
                console.error('Login error:', err);
                alert('Login failed: ' + (err.message || 'Invalid credentials'));
            }
        }
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            if (username) {
                try {
                    await loginUser(username, password);
                    window.location.href = 'home.html';
                     localStorage.setItem('username', username);
                     localStorage.setItem('email', document.getElementById('signup-email').value);
                     localStorage.setItem('phone', document.getElementById('signup-phone').value);
                    
                } catch (err) {
                    alert('Signup failed. Please try again.');
                }
            }
        });
    }
}

// ===== LOAD USER DATA =====
window.addEventListener('DOMContentLoaded', async () => {
    if (currentUser) {
        const username = currentUser.username;
        const userNameElements = document.querySelectorAll('#user-name, #display-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = username;
        });

        // Load wallet from backend
        await updateWallet();
        localStorage.setItem('wallet', currentUser.walletBalance || 0);
    }
});

// ===== LOGOUT =====
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        window.location.href = 'index.html';
    });
}

// ===== TRADE PAGE =====
function updateTradeGrid() {
    const tradeGrid = document.getElementById('trade-grid');
    if (!tradeGrid) return;

    tradeGrid.innerHTML = cryptoCoins.map(coin => `
        <div class="trade-card">
            <div class="trade-icon">${coin.icon}</div>
            <h3>${coin.name}</h3>
            <p class="trade-price">₹${coin.price.toFixed(2)}</p>
            <p class="${coin.change >= 0 ? 'price-up' : 'price-down'}">
                ${coin.change >= 0 ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%
            </p>
            <button class="btn-primary" onclick="openP2PModal('${coin.symbol}')">Trade Now</button>
        </div>
    `).join('');
}

// Dummy P2P Data
const dummyPeers = [
    { id: 1, name: 'Crypto_Ninja', avatar: '🥷', asset: 'USDT', rate: 91.50, min: 1000, max: 50000, trades: 1250, completion: '98%' },
    { id: 2, name: 'Alice_Wonder', avatar: '👩‍💼', asset: 'BTC', rate: 3850000, min: 5000, max: 200000, trades: 450, completion: '100%' },
    { id: 3, name: 'Forex_Guru', avatar: '📈', asset: 'ETH', rate: 245000, min: 2000, max: 100000, trades: 890, completion: '95%' },
    { id: 4, name: 'Satoshi_Fan', avatar: '⚡', asset: 'BTC', rate: 3845000, min: 10000, max: 500000, trades: 2100, completion: '99%' },
    { id: 5, name: 'Global_Trader', avatar: '🌍', asset: 'USDT', rate: 92.20, min: 500, max: 25000, trades: 60, completion: '90%' },
    { id: 6, name: 'Hodl_King', avatar: '💎', asset: 'ETH', rate: 246000, min: 5000, max: 150000, trades: 300, completion: '97%' },
    { id: 7, name: 'Sol_Surfer', avatar: '🏄', asset: 'SOL', rate: 9500, min: 1000, max: 50000, trades: 150, completion: '92%' },
];

let selectedPeer = null;

function openP2PModal(symbol) {
    const modal = document.getElementById('p2p-modal');
    if (!modal) return;
    document.getElementById('p2p-coin-title').textContent = `Trade ${symbol}`;
    modal.classList.add('active');
    const peers = dummyPeers.filter(p => p.asset === symbol);
    renderP2PPeers(peers.length > 0 ? peers : [], symbol);
}

function closeP2PModal() {
    const modal = document.getElementById('p2p-modal');
    if (modal) modal.classList.remove('active');
}

function renderP2PPeers(peers, symbol) {
    const container = document.getElementById('p2p-list-container');
    if (!container) return;
    if (peers.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 2rem;"><p>No active peers found for ${symbol}.</p></div>`;
        return;
    }
    container.innerHTML = `<div class="p2p-container" style="padding: 1rem;">` +
        peers.map(peer => `
        <div class="p2p-card">
            <div class="p2p-header">
                <div class="p2p-avatar">${peer.avatar}</div>
                <div class="p2p-info"><h3>${peer.name}</h3><p>${peer.trades} trades • ${peer.completion}</p></div>
                <div class="p2p-rate"><strong>₹${peer.rate.toLocaleString()}</strong><small>per ${peer.asset}</small></div>
            </div>
            <div class="p2p-limits"><span>Limit: ₹${peer.min} - ₹${peer.max}</span></div>
            <button class="btn-p2p-buy" onclick="initiateP2PTrade(${peer.id})">Buy ${peer.asset}</button>
        </div>
        `).join('') + `</div>`;
}

function initiateP2PTrade(peerId) {
    selectedPeer = dummyPeers.find(p => p.id === peerId);
    if (!selectedPeer) return;
    const container = document.getElementById('p2p-list-container');
    container.innerHTML = `
        <div class="p2p-trade-view" style="padding: 1.5rem;">
            <button onclick="openP2PModal('${selectedPeer.asset}')" class="back-link">← Back</button>
            <div class="trade-peer-info" style="display:flex; align-items:center; gap:10px; margin: 1rem 0;">
                <span style="font-size:2rem;">${selectedPeer.avatar}</span>
                <div>Buying ${selectedPeer.asset} from ${selectedPeer.name}</div>
            </div>
            <input type="number" id="trade-buy-amount" placeholder="Pay amount (₹)" oninput="calculateTradeGet()" class="input-fancy">
            <div style="text-align:center; margin: 1rem 0;">Get: <strong id="trade-get-amount">0.00</strong> ${selectedPeer.asset}</div>
            <div id="trade-error" style="color:#ef4444; height:20px;"></div>
            <button class="btn-primary btn-block" onclick="verifyTradeStep()">Confirm</button>
        </div>
    `;
}

function calculateTradeGet() {
    const amount = parseFloat(document.getElementById('trade-buy-amount').value) || 0;
    document.getElementById('trade-get-amount').textContent = (amount / selectedPeer.rate).toFixed(6);
}

function verifyTradeStep() {
    const amount = parseFloat(document.getElementById('trade-buy-amount').value);
    if (!amount || amount < selectedPeer.min || amount > selectedPeer.max) {
        alert('Invalid amount'); return;
    }
    executeTradeFinal(amount);
}

async function executeTradeFinal(amount) {
    const assetAmount = amount / selectedPeer.rate;
    try {
        await buyCrypto(selectedPeer.asset, assetAmount, selectedPeer.rate, amount);
        alert(`✅ Purchase Successful!`);
        closeP2PModal();
        await updateWallet();
    } catch (err) {
        alert("Trade failed: " + err.message);
    }
}
localStorage.removeItem('cryptoverse_wallet');
async function updateWallet() {
    if (!currentUser) return;

    try {
        const remoteWallet = await getWallet();   // ✅ NOW it is defined properly

        if (!remoteWallet) return;

        // ✅ Force safe numeric balance
        window.wallet = {
            balance: Number(remoteWallet.balance) || 0,
            coins: remoteWallet.coins || {}
        };

        // Save to localStorage for wallet_handlers.js
        localStorage.setItem('cryptoverse_wallet', JSON.stringify(window.wallet));

        // Update UI everywhere
        if (typeof updateWalletDisplay === "function") {
            updateWalletDisplay();
        }

    } catch (err) {
        console.error("Wallet fetch failed:", err);
    }
}

// ===== WALLET PAGE =====


window.updateModalBalance = function () {
    const el = document.getElementById('modal-balance-modal');
    if (el && window.wallet) {
        el.textContent = `₹${Number(window.wallet.balance).toFixed(2)}`;
    }
};

function getSymbolIcon(symbol) {
    const icons = { 'BTC': '₿', 'ETH': 'Ξ', 'ADA': '₳', 'SOL': '◎', 'DOT': '●', 'XRP': '✕', 'DOGE': 'Ð', 'AVAX': '▲' };
    return icons[symbol] || '🪙';
}

if (document.getElementById('wallet-coins')) {
    updateWallet();
}

// ===== MARKET PAGE =====
function updateMarketList() {
    const marketList = document.getElementById('market-list');
    if (!marketList) return;

    marketList.innerHTML = cryptoCoins.map(coin => `
        <div class="market-card" onclick="showCoinDetail(${coin.id})">
            <div class="market-icon">${coin.icon}</div>
            <div class="market-info">
                <h3>${coin.name}</h3>
                <p>${coin.symbol}</p>
            </div>
            <div class="market-price">
                <p class="price">₹${coin.price.toFixed(2)}</p>
                <p class="${coin.change >= 0 ? 'price-up' : 'price-down'}">
                    ${coin.change >= 0 ? '▲' : '▼'} ${Math.abs(coin.change).toFixed(2)}%
                </p>
            </div>
        </div>
    `).join('');
}

// Simplified Market functions to avoid duplication with market.js
// If market.js is present, it will override these.
if (document.getElementById('market-list')) {
    updateMarketList();
}

// Buy button logic for fallback or simple pages
const buyBtn = document.getElementById('buy-btn');
if (buyBtn) {
    buyBtn.addEventListener('click', async () => {
        if (!selectedCoin) return;
        const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
        const totalCost = selectedCoin.price * amount;
        const paymentMethod = document.getElementById('payment-method')?.value || 'wallet';

        if (amount <= 0) {
            alert('Please enter a valid amount!');
            return;
        }

        if (paymentMethod === 'wallet') {
            try {
                await buyCrypto(selectedCoin.symbol, amount, selectedCoin.price, totalCost);
                alert(`✅ Purchase Successful!`);
                await updateWallet();
            } catch (err) {
                alert(`❌ Purchase Failed: ${err.message}`);
            }
        }
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}