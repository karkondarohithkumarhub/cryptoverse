// Wallet UI Handlers - Complete Version
window.pendingAmount = 0;
window.selectedPeer = null;
window.currentPaymentMethod = null;
window.currentTransactionType = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Wallet Handlers Loaded');
});

// Open wallet modal
window.openAddMoney = function () {
    const modal = document.getElementById('add-money-modal');
    if (modal) {
        modal.classList.add('active');
        window.updateModalBalance();
        // Show main screen
        document.getElementById('wallet-main').style.display = 'block';
        document.getElementById('deposit-section').style.display = 'none';
        document.getElementById('withdraw-section').style.display = 'none';
        document.getElementById('payment-details').style.display = 'none';
    }
};

// Close wallet modal
window.closeAddMoney = function () {
    const modal = document.getElementById('add-money-modal');
    if (modal) modal.classList.remove('active');
};

// Show payment section
window.showPaymentSection = function (type) {
    document.getElementById('wallet-main').style.display = 'none';
    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById(type + '-section').style.display = 'block';
};

// Back to main screen
window.backToMain = function () {
    document.getElementById('wallet-main').style.display = 'block';
    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
};

// Back to payment method selection
window.backToPaymentSection = function () {
    document.getElementById('payment-details').style.display = 'none';
    if (window.currentTransactionType === 'deposit') {
        document.getElementById('deposit-section').style.display = 'block';
    } else {
        document.getElementById('withdraw-section').style.display = 'block';
    }
};

// Update modal balance
window.updateModalBalance = function () {
    const el = document.getElementById('modal-balance');
    if (el && window.wallet) {
        el.textContent = `₹${window.wallet.balance.toFixed(2)}`;
    }
};

// Show payment method details
window.showPaymentDetails = function (method, type) {
    const amount = type === 'deposit' ? 
        parseFloat(document.getElementById('deposit-amount').value) :
        parseFloat(document.getElementById('withdraw-amount').value);
    
    if (!amount || amount < 100) {
        alert('⚠️ Please enter a valid amount (Minimum ₹100)');
        return;
    }
    
    if (type === 'withdraw' && window.wallet && amount > window.wallet.balance) {
        alert(`⚠️ Insufficient balance! You have ₹${window.wallet.balance.toFixed(2)}`);
        return;
    }
    
    window.currentPaymentMethod = method;
    window.currentTransactionType = type;
    window.pendingAmount = amount;
    
    // Hide payment sections
    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    
    // Show payment details
    const detailsDiv = document.getElementById('payment-details');
    detailsDiv.style.display = 'block';
    
    // Generate content based on method
    let content = `<h3>${type === 'deposit' ? 'Deposit' : 'Withdraw'} ₹${amount}</h3>`;
    
    if (method === 'upi') {
        content += `
            <div class="payment-method-content">
                <p class="method-label">Select your UPI App:</p>
                <div class="upi-apps">
                    <div class="upi-app" onclick="processTransaction()">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23228ae6' width='100' height='100'/%3E%3Ctext x='50' y='60' font-size='40' fill='white' text-anchor='middle' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E" alt="Google Pay">
                        <span>Google Pay</span>
                    </div>
                    <div class="upi-app" onclick="processTransaction()">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%2301a5fb' width='100' height='100'/%3E%3Ctext x='50' y='60' font-size='30' fill='white' text-anchor='middle' font-weight='bold'%3EPHONE%3C/text%3E%3C/svg%3E" alt="PhonePe">
                        <span>PhonePe</span>
                    </div>
                    <div class="upi-app" onclick="processTransaction()">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%2300a3e0' width='100' height='100'/%3E%3Ctext x='50' y='60' font-size='40' fill='white' text-anchor='middle' font-weight='bold'%3EP%3C/text%3E%3C/svg%3E" alt="Paytm">
                        <span>Paytm</span>
                    </div>
                </div>
                <p class="method-hint">Select any UPI app to proceed with payment</p>
            </div>
        `;
    } else if (method === 'card') {
        content += `
            <div class="payment-method-content">
                <p class="method-label">Enter Card Details:</p>
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry (MM/YY)</label>
                        <input type="text" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" maxlength="4">
                    </div>
                </div>
                <div class="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="Your Name">
                </div>
                <button class="btn-primary" onclick="processTransaction()" style="margin-top: 1rem;">Pay ₹${amount}</button>
            </div>
        `;
    } else if (method === 'bank') {
        content += `
            <div class="payment-method-content">
                <p class="method-label">${type === 'deposit' ? 'Bank Account to Transfer From:' : 'Bank Account to Transfer To:'}</p>
                <div class="form-group">
                    <label>Bank Name</label>
                    <input type="text" placeholder="e.g., HDFC Bank">
                </div>
                <div class="form-group">
                    <label>Account Number</label>
                    <input type="text" placeholder="Enter your account number">
                </div>
                <div class="form-group">
                    <label>IFSC Code</label>
                    <input type="text" placeholder="e.g., HDFC0000001">
                </div>
                <div class="form-group">
                    <label>Account Holder Name</label>
                    <input type="text" placeholder="Your Name">
                </div>
                <button class="btn-primary" onclick="processTransaction()" style="margin-top: 1rem;">Proceed ₹${amount}</button>
            </div>
        `;
    } else if (method === 'qr') {
        content += `
            <div class="payment-method-content">
                <p class="method-label">Scan QR Code to ${type === 'deposit' ? 'Send Payment' : 'Receive Payment'}</p>
                <div class="qr-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="qr-code">
                        <rect fill="white" width="200" height="200"/>
                        <rect x="20" y="20" width="40" height="40" fill="black"/>
                        <rect x="140" y="20" width="40" height="40" fill="black"/>
                        <rect x="20" y="140" width="40" height="40" fill="black"/>
                        <rect x="60" y="60" width="80" height="80" fill="black"/>
                    </svg>
                </div>
                <p class="method-hint">Amount: ₹${amount}</p>
                <button class="btn-primary" onclick="processTransaction()" style="margin-top: 1rem;">Confirm Payment Received</button>
            </div>
        `;
    }
    
    document.getElementById('payment-method-form').innerHTML = content;
};

// Process transaction
window.processTransaction = function () {
    const type = window.currentTransactionType;
    const method = window.currentPaymentMethod;
    const amount = window.pendingAmount;
    
    const methodNames = {
        'upi': 'UPI',
        'card': 'Card',
        'bank': 'Bank Transfer',
        'qr': 'QR Code'
    };
    
    if (type === 'deposit') {
        if (window.wallet) {
            window.wallet.balance += amount;
            window.updateModalBalance();
            if (window.updateWallet) window.updateWallet();
        }
        alert(`✅ Successfully deposited ₹${amount} via ${methodNames[method]}!`);
    } else {
        if (window.wallet) {
            window.wallet.balance -= amount;
            window.updateModalBalance();
            if (window.updateWallet) window.updateWallet();
        }
        alert(`✅ Successfully withdrawn ₹${amount} via ${methodNames[method]}!`);
    }
    
    window.backToMain();
};

window.renderMethodDetails = function (method, type) {
    const contentEl = document.getElementById('method-content');
    const titleEl = document.getElementById('method-title');
    const actionBtn = document.getElementById('action-btn');

    // Reset Button
    actionBtn.onclick = null;
    actionBtn.disabled = false;
    actionBtn.textContent = 'Proceed';
    actionBtn.style.display = 'block';

    let html = '';
    titleEl.textContent = type === 'deposit' ? `Deposit via ${method.toUpperCase()}` : `Withdraw to ${method.toUpperCase()}`;

    // 1. P2P Logic
    if (method === 'p2p') {
        titleEl.textContent = 'P2P Marketplace';
        html = '<div class="p2p-list" style="display:flex; flex-direction:column; gap:1rem;">';
        dummyPeers.forEach(peer => {
            html += `
            <div class="peer-card" onclick="selectPeer(${peer.id})" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; cursor:pointer; border:1px solid transparent; transition:all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:1.5rem;">${peer.avatar}</span>
                        <div>
                            <div style="font-weight:bold; color:white;">${peer.name}</div>
                            <div style="font-size:0.8rem; color:#aaa;">Selling ${peer.asset}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#10b981; font-weight:bold;">₹${peer.rate}</div>
                        <div style="font-size:0.8rem; color:#aaa;">Min: ₹${peer.min}</div>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
        actionBtn.style.display = 'none'; // Hide default button for P2P list
    }
    // 2. UPI Logic
    else if (method === 'upi') {
        html = `
            <div style="text-align:center;">
                <div style="margin-bottom:1.5rem;">
                    <p style="color:#aaa; margin-bottom:0.5rem;">Amount to ${type}</p>
                    <h1 style="color:#fff; font-size:2.5rem;">₹${window.pendingAmount.toFixed(2)}</h1>
                </div>
                <input type="text" placeholder="Enter UPI ID (e.g. user@okybl)" style="width:100%; padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white; margin-bottom:1rem;">
                <p style="font-size:0.9rem; color:#aaa;">Open your UPI app to complete the request.</p>
            </div>
        `;
        actionBtn.textContent = `Pay ₹${window.pendingAmount}`;
        actionBtn.onclick = () => window.processTransaction(type, method);
    }
    // 3. QR Code Logic
    else if (method === 'qr' && type === 'deposit') {
        html = `
            <div style="text-align:center;">
                <div style="background:white; padding:1rem; display:inline-block; border-radius:12px; margin-bottom:1.5rem;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=cryptoverse@upi&pn=CryptoVerse&am=${window.pendingAmount}" alt="QR Code">
                </div>
                <p style="color:#fff; font-weight:bold; margin-bottom:0.5rem;">Scan to Pay ₹${window.pendingAmount}</p>
                <p style="font-size:0.9rem; color:#aaa;">Use any UPI app (GPay, PhonePe, Paytm)</p>
            </div>
        `;
        actionBtn.textContent = "I Have Paid";
        actionBtn.onclick = () => window.processTransaction(type, method);
    }
    // 4. Card Logic
    else if (method === 'card') {
        html = `
            <div style="display:flex; flex-direction:column; gap:1rem;">
                <input type="text" placeholder="Card Number" maxlength="16" style="padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white;">
                <div style="display:flex; gap:1rem;">
                    <input type="text" placeholder="MM/YY" style="padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white; flex:1;">
                    <input type="text" placeholder="CVV" maxlength="3" style="padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white; flex:1;">
                </div>
                <input type="text" placeholder="Cardholder Name" style="padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white;">
            </div>
        `;
        actionBtn.textContent = `Pay ₹${window.pendingAmount}`;
        actionBtn.onclick = () => window.processTransaction(type, method);
    }
    // 5. Bank Logic
    else if (method === 'bank') {
        html = `
            <div style="text-align:center;">
                <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; text-align:left; margin-bottom:1rem;">
                    <p style="color:#aaa; font-size:0.9rem;">Bank Name</p>
                    <p style="color:white; font-weight:bold;">HDFC Bank</p>
                    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:0.5rem 0;">
                    <p style="color:#aaa; font-size:0.9rem;">Account Number</p>
                    <p style="color:white; font-weight:bold;">XXXX-XXXX-8899</p>
                </div>
                <input type="text" placeholder="Transaction ID (UTR)" style="width:100%; padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white;">
            </div>
        `;
        actionBtn.textContent = "Submit Reference";
        actionBtn.onclick = () => window.processTransaction(type, method);
    }

    contentEl.innerHTML = html;
};

// --- P2P Specific Functions ---

window.selectPeer = function (id) {
    const peer = dummyPeers.find(p => p.id === id);
    if (!peer) return;
    window.selectedPeer = peer;

    const contentEl = document.getElementById('method-content');
    contentEl.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:3rem; margin-bottom:0.5rem;">${peer.avatar}</div>
            <h3 style="color:white; margin-bottom:0.5rem;">Buy ${peer.asset} from ${peer.name}</h3>
            <p style="color:#10b981; margin-bottom:1.5rem;">Rate: ₹${peer.rate}</p>
            
            <input type="number" id="p2p-amount" placeholder="Enter Amount (₹${peer.min} - ₹${peer.max})" 
                style="width:100%; padding:1rem; border-radius:12px; border:1px solid #333; background:rgba(0,0,0,0.3); color:white; margin-bottom:1rem; text-align:center; font-size:1.2rem;">
            
            <p id="p2p-calc" style="color:#aaa; font-size:0.9rem;">You receive: 0 ${peer.asset}</p>
        </div>
    `;

    // Add input listener
    const input = document.getElementById('p2p-amount');
    input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        document.getElementById('p2p-calc').textContent = `You receive: ${(val / peer.rate).toFixed(6)} ${peer.asset}`;
    });

    const actionBtn = document.getElementById('action-btn');
    actionBtn.style.display = 'block';
    actionBtn.textContent = 'Confirm Purchase';
    actionBtn.onclick = () => {
        const amount = parseFloat(input.value);
        if (!amount || amount < peer.min || amount > peer.max) {
            alert(`⚠️ Amount must be between ₹${peer.min} and ₹${peer.max}`);
            return;
        }
        if (window.wallet && amount > window.wallet.balance) {
            alert('⚠️ Insufficient wallet balance!');
            return;
        }
        window.pendingAmount = amount;
        window.executeP2PTrade();
    };
};

window.executeP2PTrade = async function () {
    try {
        const btn = document.getElementById('action-btn');
        btn.textContent = 'Processing...';
        btn.disabled = true;

        const assetAmount = window.pendingAmount / window.selectedPeer.rate;

        // Use the buyCrypto API
        await window.buyCrypto(window.selectedPeer.asset, assetAmount, window.selectedPeer.rate, window.pendingAmount);

        alert(`✅ P2P Trade Successful!\nBought ${assetAmount.toFixed(6)} ${window.selectedPeer.asset}`);
        if (window.updateWallet) await window.updateWallet();
        window.closeAddMoney();

    } catch (err) {
        alert('❌ Trade Failed: ' + err.message);
        document.getElementById('action-btn').disabled = false;
    }
};

// --- Transaction Processing ---

window.processTransaction = async function (type, method) {
    const btn = document.getElementById('action-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
        if (type === 'deposit') {
            await window.depositMoney(window.pendingAmount, method);
            alert(`✅ Deposit of ₹${window.pendingAmount} successful!`);
        } else {
            await window.withdrawMoney(window.pendingAmount, method);
            alert(`✅ Withdrawal of ₹${window.pendingAmount} initiated!`);
        }

        if (window.updateWallet) await window.updateWallet();
        window.closeAddMoney();

    } catch (err) {
        alert('❌ Transaction Failed: ' + err.message);
        btn.textContent = 'Retry';
        btn.disabled = false;
    }
};
