// Crypto Mining Page - Real-time Mining Management
// Features: Mining status, real-time updates, pool selection, earnings tracking

// Mining coins data
const miningCoins = [
    {
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: '₿',
        difficulty: 'Very High',
        mineable: true,
        active: false,
        hashRate: 0,
        earned24h: 0,
        uptime: 0,
        efficiency: 0,
        power: 1500,
        rewardPerBlock: 0.00005,
        currentPrice: 4523450
    },
    {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: '⟠',
        difficulty: 'High',
        mineable: true,
        active: false,
        hashRate: 0,
        earned24h: 0,
        uptime: 0,
        efficiency: 0,
        power: 1200,
        rewardPerBlock: 0.0008,
        currentPrice: 235480
    },
    {
        id: 'ltc',
        name: 'Litecoin',
        symbol: 'LTC',
        icon: 'Ł',
        difficulty: 'Medium',
        mineable: true,
        active: false,
        hashRate: 0,
        earned24h: 0,
        uptime: 0,
        efficiency: 0,
        power: 800,
        rewardPerBlock: 0.005,
        currentPrice: 12450
    },
    {
        id: 'doge',
        name: 'Dogecoin',
        symbol: 'DOGE',
        icon: '🐕',
        difficulty: 'Medium',
        mineable: true,
        active: false,
        hashRate: 0,
        earned24h: 0,
        uptime: 0,
        efficiency: 0,
        power: 700,
        rewardPerBlock: 0.5,
        currentPrice: 22.50
    },
    {
        id: 'xmr',
        name: 'Monero',
        symbol: 'XMR',
        icon: '🔒',
        difficulty: 'Medium-High',
        mineable: true,
        active: false,
        hashRate: 0,
        earned24h: 0,
        uptime: 0,
        efficiency: 0,
        power: 950,
        rewardPerBlock: 0.3,
        currentPrice: 15680
    }
];

// Mining state
let miningState = {
    isRunning: false,
    selectedPool: 'official',
    totalHashRate: 0,
    totalEarnings: 0,
    startTime: null,
    updateInterval: null,
    lastUpdate: new Date()
};

// Pool configurations
const poolConfigs = {
    official: { name: 'Cryptoverse Official Pool', fee: 0.01, minPayout: 100, blockTime: 4.2 },
    pro: { name: 'Pro Mining Pool', fee: 0.02, minPayout: 50, blockTime: 3.8 },
    p2p: { name: 'Peer-to-Peer Pool', fee: 0.005, minPayout: 200, blockTime: 5.1 }
};

// Initialize mining page
function initMiningPage() {
    renderMiningCards();
    setupEventListeners();
    startRealTimeUpdates();
    loadMiningProgress();
}

// Render mining cards
function renderMiningCards() {
    const grid = document.getElementById('miningGrid');
    grid.innerHTML = '';

    miningCoins.forEach(coin => {
        const card = document.createElement('div');
        card.className = `mining-card ${coin.active ? 'active' : ''}`;
        card.id = `coin-${coin.id}`;

        const efficiency = calculateEfficiency(coin);
        const progressPercent = coin.active ? Math.random() * 100 : 0;

        card.innerHTML = `
            <div class="card-header">
                <div class="coin-icon">${coin.icon}</div>
                <div class="coin-info">
                    <h3>${coin.name}</h3>
                    <p>${coin.difficulty} • ${coin.symbol}</p>
                </div>
            </div>

            <div class="mining-progress">
                <div class="progress-label">
                    <span>Mining Progress</span>
                    <span id="progress-${coin.id}">${progressPercent.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="fill-${coin.id}" style="width: ${progressPercent}%"></div>
                </div>
            </div>

            <div class="efficiency-meter">
                <div class="efficiency-label">Efficiency</div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${efficiency}%"></div>
                </div>
                <span style="color: #00d4ff; font-weight: 600; font-size: 0.85rem;" id="eff-${coin.id}">${efficiency.toFixed(1)}%</span>
            </div>

            <div class="card-stats">
                <div class="card-stat">
                    <div class="card-stat-label">Hash Rate</div>
                    <div class="card-stat-value" id="hash-${coin.id}">${coin.hashRate.toFixed(2)} MH/s</div>
                </div>
                <div class="card-stat">
                    <div class="card-stat-label">24h Earned</div>
                    <div class="card-stat-value earned" id="earned-${coin.id}">₹${coin.earned24h.toFixed(2)}</div>
                </div>
            </div>

            <div class="card-controls">
                <button class="mining-btn ${coin.active ? 'stop' : 'start'}" id="btn-${coin.id}">
                    ${coin.active ? '⏹ Stop' : '▶ Start'}
                </button>
                <button class="mining-btn" style="background: linear-gradient(135deg, #0066ff, #00d4ff); color: white;" id="info-${coin.id}">
                    ℹ Details
                </button>
            </div>

            <div class="mining-status ${coin.active ? 'active' : 'inactive'}" id="status-${coin.id}">
                ${coin.active ? '🟢 Active' : '⚪ Inactive'}
            </div>
        `;

        grid.appendChild(card);

        // Add event listeners
        document.getElementById(`btn-${coin.id}`).addEventListener('click', () => toggleMining(coin.id));
        document.getElementById(`info-${coin.id}`).addEventListener('click', () => showCoinDetails(coin.id));
    });
}

// Toggle mining for a coin
function toggleMining(coinId) {
    const coin = miningCoins.find(c => c.id === coinId);
    if (!coin) return;

    coin.active = !coin.active;

    if (coin.active) {
        coin.startTime = Date.now();
        showMessage(`Started mining ${coin.name}!`, 'success');
    } else {
        showMessage(`Stopped mining ${coin.name}`, 'success');
    }

    renderMiningCards();
    updateMiningStats();
}

// Calculate efficiency based on hash rate and power consumption
function calculateEfficiency(coin) {
    if (!coin.active) return 0;
    const hashPerWatt = (coin.hashRate * 1000) / coin.power;
    return Math.min(100, (hashPerWatt / 2) * 100); // Normalized to 100%
}

// Update mining statistics in real-time
function updateMiningStats() {
    let totalHashRate = 0;
    let activeCount = 0;
    let totalEarned = 0;

    miningCoins.forEach(coin => {
        if (coin.active) {
            // Simulate hash rate increase (0.5-2 MH/s per coin)
            coin.hashRate = Math.max(coin.hashRate, 0.5 + Math.random() * 1.5);
            
            // Simulate earning (more with higher hash rate)
            const earnedThisSecond = (coin.hashRate / 100) * coin.currentPrice * 0.000001;
            coin.earned24h += earnedThisSecond;
            
            // Update uptime
            if (coin.startTime) {
                coin.uptime = Math.floor((Date.now() - coin.startTime) / 1000);
            }

            totalHashRate += coin.hashRate;
            totalEarned += coin.earned24h;
            activeCount++;
        } else {
            coin.hashRate = 0;
        }
    });

    miningState.totalHashRate = totalHashRate;
    miningState.totalEarnings = totalEarned;
    miningState.lastUpdate = new Date();

    // Update UI
    updateStatsDisplay(activeCount);
    updateMiningTable();
    renderMiningCards();
}

// Update statistics display
function updateStatsDisplay(activeCount) {
    const pool = poolConfigs[miningState.selectedPool];
    const earningsAfterFee = miningState.totalEarnings * (1 - pool.fee);

    document.getElementById('totalHashRate').textContent = miningState.totalHashRate.toFixed(2) + ' MH/s';
    document.getElementById('totalEarnings').textContent = '₹' + earningsAfterFee.toFixed(2);
    document.getElementById('activeMiners').textContent = activeCount;

    // Calculate average efficiency
    const activeMiningCoins = miningCoins.filter(c => c.active);
    const avgEfficiency = activeMiningCoins.length > 0
        ? activeMiningCoins.reduce((sum, c) => sum + calculateEfficiency(c), 0) / activeMiningCoins.length
        : 0;
    document.getElementById('efficiency').textContent = avgEfficiency.toFixed(1) + '%';

    // Update last update time
    const now = new Date();
    const secondsAgo = Math.floor((now - miningState.lastUpdate) / 1000);
    document.getElementById('lastUpdate').textContent = `Last update: ${secondsAgo < 60 ? secondsAgo + 's ago' : 'Just now'}`;
}

// Update mining statistics table
function updateMiningTable() {
    const tbody = document.getElementById('miningStats');
    tbody.innerHTML = '';

    miningCoins.forEach(coin => {
        if (coin.active) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td style="color: #00d4ff; font-weight: 600;">${coin.icon} ${coin.symbol}</td>
                <td><span style="color: #00ff00; font-weight: 600;">🟢 Active</span></td>
                <td class="hash-rate">${coin.hashRate.toFixed(2)} MH/s</td>
                <td class="earned-amount">₹${coin.earned24h.toFixed(2)}</td>
                <td>${formatUptime(coin.uptime)}</td>
                <td>${coin.difficulty}</td>
            `;
        }
    });

    if (tbody.children.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td colspan="6" style="text-align: center; color: #a0a0a0; padding: 30px;">
                No active mining. Start mining a coin to see statistics.
            </td>
        `;
    }
}

// Format uptime display
function formatUptime(seconds) {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    return Math.floor(seconds / 3600) + 'h ' + Math.floor((seconds % 3600) / 60) + 'm';
}

// Show coin details modal
function showCoinDetails(coinId) {
    const coin = miningCoins.find(c => c.id === coinId);
    if (!coin) return;

    const details = `
    Coin: ${coin.name} (${coin.symbol})
    Icon: ${coin.icon}
    
    Difficulty: ${coin.difficulty}
    Power Consumption: ${coin.power}W
    Reward per Block: ${coin.rewardPerBlock} ${coin.symbol}
    Current Price: ₹${coin.currentPrice.toFixed(2)}
    
    Current Hash Rate: ${coin.hashRate.toFixed(2)} MH/s
    Earnings (24h): ₹${coin.earned24h.toFixed(2)}
    Efficiency: ${calculateEfficiency(coin).toFixed(1)}%
    `;

    alert(details);
}

// Setup event listeners
function setupEventListeners() {
    // Pool selection
    document.querySelectorAll('input[name="pool"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            miningState.selectedPool = e.target.value;
            showMessage(`Switched to ${poolConfigs[e.target.value].name}`, 'success');
            updateStatsDisplay(miningCoins.filter(c => c.active).length);
        });
    });
}

// Start real-time updates
function startRealTimeUpdates() {
    if (miningState.updateInterval) {
        clearInterval(miningState.updateInterval);
    }

    // Update every 3 seconds
    miningState.updateInterval = setInterval(() => {
        updateMiningStats();
    }, 3000);
}

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    messageEl.textContent = text;
    messageEl.classList.add('show');

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Load mining progress from localStorage
function loadMiningProgress() {
    const saved = localStorage.getItem('miningProgress');
    if (saved) {
        const data = JSON.parse(saved);
        miningCoins.forEach(coin => {
            const savedCoin = data.find(c => c.id === coin.id);
            if (savedCoin) {
                coin.earned24h = savedCoin.earned24h;
                coin.active = savedCoin.active;
                if (coin.active) {
                    coin.startTime = Date.now();
                }
            }
        });
    }
}

// Save mining progress to localStorage
function saveMiningProgress() {
    const data = miningCoins.map(coin => ({
        id: coin.id,
        earned24h: coin.earned24h,
        active: coin.active
    }));
    localStorage.setItem('miningProgress', JSON.stringify(data));
}

// Periodic save
setInterval(saveMiningProgress, 10000);

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (miningState.updateInterval) {
            clearInterval(miningState.updateInterval);
        }
    } else {
        startRealTimeUpdates();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initMiningPage);

// Update every 3 seconds
setInterval(() => {
    updateMiningStats();
}, 3000);
