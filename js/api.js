// API Client for Cryptoverse Backend
const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

// Current user
let currentUser = null;
let socket = null;

// Initialize Socket.io
function initSocket() {
    if (typeof io === 'undefined') {
        console.warn("Socket.io client script not loaded. Real-time updates disabled.");
        return;
    }

    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('🔌 Connected to real-time server');
        if (currentUser) {
            socket.emit('subscribe', currentUser.id);
        }
    });

    socket.on('walletUpdate', (data) => {
        console.log('💰 Real-time Wallet Update:', data);
        // Update local wallet cache if app.js is present
        if (typeof wallet !== 'undefined') {
            wallet.balance = data.balance;
            wallet.coins = data.coins;
            // Trigger UI update if function exists
            if (typeof updateWallet === 'function') updateWallet();
        }
    });

    socket.on('adminUpdate', () => {
        // Trigger admin refresh if on admin page
        if (typeof refreshAdminData === 'function') refreshAdminData();
    });
}

// Initialize - load user from localStorage
function initAPI() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            // Initialize socket if user exists
            initSocket();
        } catch (e) {
            console.error("Failed to parse currentUser", e);
            localStorage.removeItem('currentUser');
        }
    } else {
        initSocket();
    }
}

// Login/Register
async function loginUser(username, password = '123456') {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Subscribe to updates for this user
        if (socket && socket.connected) {
            socket.emit('subscribe', currentUser.id);
        }

        return currentUser;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Get wallet
async function getWallet() {
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_URL}/wallet/${currentUser.id}`);
        if (response.status === 404) {
            // User likely deleted in a database reset
            console.warn("User session orphaned. Logging out...");
            // logoutUser();
            // window.location.href = 'index.html';
            return null;
        }
        if (!response.ok) {
            throw new Error('Failed to get wallet');
        }
        return await response.json();
    } catch (error) {
        console.error('Get wallet error:', error);
        throw error;
    }
}

// Update wallet (General purpose) - Kept for compatibility but backend now broadcasts
async function updateWalletApi(balance, coins, transaction = null) {
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_URL}/wallet/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // ... body
        });
        // ...
    } catch (error) {
        // ...
    }
}

// Deposit money
async function depositMoney(amount, method) {
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_URL}/wallet/${currentUser.id}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, method })
        });

        if (!response.ok) {
            throw new Error('Failed to deposit');
        }
        return await response.json();
    } catch (error) {
        console.error('Deposit error:', error);
        throw error;
    }
}

// Withdraw money
async function withdrawMoney(amount, method) {
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_URL}/wallet/${currentUser.id}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, method })
        });

        if (!response.ok) {
            throw new Error('Failed to withdraw');
        }
        return await response.json();
    } catch (error) {
        console.error('Withdraw error:', error);
        throw error;
    }
}

// Buy crypto
async function buyCrypto(coin, amount, price, totalCost) {
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_URL}/wallet/${currentUser.id}/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coin, amount, price, totalCost })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to buy crypto');
        }
        return await response.json();
    } catch (error) {
        console.error('Buy crypto error:', error);
        throw error;
    }
}

// Logout
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('wallet'); // Clean up legacy data
    if (socket) socket.disconnect();
}

// Initialize on load
initAPI();