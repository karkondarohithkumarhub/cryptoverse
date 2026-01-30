// ================= WALLET STATE =================
const savedWallet = JSON.parse(localStorage.getItem('cryptoverse_wallet'));

window.wallet = {
    balance: Number(savedWallet?.balance) || 0,
    coins: savedWallet?.coins || {}
};


window.pendingAmount = 0;
window.selectedPeer = null;
window.currentPaymentMethod = null;
window.currentTransactionType = null;

// ================= ON PAGE LOAD =================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Wallet Handlers Loaded');
    window.updateWalletDisplay();
    window.updateModalBalance();
});

// ================= BALANCE DISPLAY =================
window.updateWalletDisplay = function () {
    const balanceEl = document.getElementById('main-wallet-balance');
    const modalEl = document.getElementById('modal-balance-modal');

    const balance = Number(window.wallet?.balance) || 0;

    if (balanceEl) balanceEl.textContent = `₹${balance.toFixed(2)}`;
    if (modalEl) modalEl.textContent = `₹${balance.toFixed(2)}`;

    localStorage.setItem(
  "cryptoverse_wallet",
  JSON.stringify(window.wallet)
);

};

localStorage.getItem("cryptoverse_wallet")


// ================= MODAL BALANCE DISPLAY =================
window.updateModalBalance = function () {
    const el = document.getElementById('modal-balance-modal');
    if (el && window.wallet) {
        el.textContent = `₹${Number(window.wallet.balance).toFixed(2)}`;
    }
};

// ================= OPEN/CLOSE MODAL =================
window.openAddMoney = function () {
    const modal = document.getElementById('add-money-modal');
    if (!modal) return;
    modal.classList.add('active');
    window.updateModalBalance();

    document.getElementById('wallet-main').style.display = 'block';
    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
};

window.closeAddMoney = function () {
    const modal = document.getElementById('add-money-modal');
    if (modal) modal.classList.remove('active');
};

// ================= NAVIGATION =================
window.showPaymentSection = function (type) {
    document.getElementById('wallet-main').style.display = 'none';
    document.getElementById('deposit-section').style.display = type === 'deposit' ? 'block' : 'none';
    document.getElementById('withdraw-section').style.display = type === 'withdraw' ? 'block' : 'none';
    document.getElementById('payment-details').style.display = 'none';
};

window.backToMain = function () {
    document.getElementById('wallet-main').style.display = 'block';
    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    document.getElementById('payment-details').style.display = 'none';
};

window.backToPaymentSection = function () {
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById(window.currentTransactionType + '-section').style.display = 'block';
};

// ================= SHOW PAYMENT DETAILS =================
window.showPaymentDetails = function (method, type) {
    const amount = type === 'deposit'
        ? parseFloat(document.getElementById('deposit-amount').value)
        : parseFloat(document.getElementById('withdraw-amount').value);

    if (!amount || amount < 100) {
        alert('⚠️ Minimum amount is ₹100');
        return;
    }

    if (type === 'withdraw' && amount > Number(window.wallet.balance)) {
        alert(`⚠️ Insufficient balance! Available: ₹${window.wallet.balance.toFixed(2)}`);
        return;
    }

    window.currentPaymentMethod = method;
    window.currentTransactionType = type;
    window.pendingAmount = amount;

    document.getElementById('deposit-section').style.display = 'none';
    document.getElementById('withdraw-section').style.display = 'none';
    document.getElementById('payment-details').style.display = 'block';

    let html = `<h3>${type === 'deposit' ? 'Deposit' : 'Withdraw'} ₹${amount}</h3>`;

    html += `<button class="btn-primary" onclick="processTransaction()">Confirm via ${method.toUpperCase()}</button>`;

    document.getElementById('payment-method-form').innerHTML = html;
};

// ================= PROCESS TRANSACTION =================
window.processTransaction = async function () {
    const type = window.currentTransactionType;
    const amount = Number(window.pendingAmount);

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    try {
        if (type === 'deposit') {
            const res = await depositMoney(amount, window.currentPaymentMethod);
            window.wallet.balance = Number(res.balance) || 0;
            alert(`✅ Deposited ₹${amount}`);
        } else {
            const res = await withdrawMoney(amount, window.currentPaymentMethod);
            window.wallet.balance = Number(res.balance) || 0;
            alert(`✅ Withdrawn ₹${amount}`);
        }
    } catch (err) {
        alert("Transaction failed");
        console.error(err);
        return;
    }

    window.updateWalletDisplay();
    window.backToMain();
};

