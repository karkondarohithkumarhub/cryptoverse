const ADMIN_API = 'http://localhost:3001/api/admin';

async function adminLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const response = await fetch('http://localhost:3001/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('logged-admin').textContent = data.admin.username;
            localStorage.setItem('adminSession', 'true');
            loadDashboard();
            setInterval(loadDashboard, 5000); // Auto refresh
        } else {
            errorMsg.textContent = data.error || 'Login failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Server error';
        errorMsg.style.display = 'block';
    }
}

async function loadDashboard() {
    try {
        // Fetch Stats
        const statsRes = await fetch(`${ADMIN_API}/stats`);
        const stats = await statsRes.json();
        document.getElementById('stat-users').textContent = stats.userCount;
        document.getElementById('stat-volume').textContent = `₹${stats.totalVolume.toLocaleString()}`;

        // Fetch Users
        const usersRes = await fetch(`${ADMIN_API}/users`);
        const users = await usersRes.json();
        const userRows = document.getElementById('user-rows');
        userRows.innerHTML = users.map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.id}</td>
                <td>${new Date(u.createdAt).toLocaleString()}</td>
                <td>₹${u.balance.toLocaleString()}</td>
            </tr>
        `).join('');

        // Fetch Transactions
        const txRes = await fetch(`${ADMIN_API}/transactions`);
        const transactions = await txRes.json();
        const txRows = document.getElementById('tx-rows');
        txRows.innerHTML = transactions.map(tx => `
            <tr>
                <td>${tx.username}</td>
                <td><span class="price-${tx.type === 'buy' ? 'up' : 'down'}">${tx.type.toUpperCase()}</span></td>
                <td>${tx.coin || '-'}</td>
                <td>${tx.amount ? tx.amount.toFixed(4) : '-'}</td>
                <td>${tx.totalCost ? '₹' + tx.totalCost.toLocaleString() : '-'}</td>
                <td>${new Date(tx.timestamp).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    }
}

// Auto-login check if session exists (simple)
if (localStorage.getItem('adminSession') === 'true') {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('logged-admin').textContent = 'Admin';
    loadDashboard();
    setInterval(loadDashboard, 5000);
}
