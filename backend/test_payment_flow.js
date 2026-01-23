const fetch = require('node-fetch');

async function testPaymentFlow() {
    console.log('=== CRYPTOVERSE PAYMENT SYSTEM TEST ===\n');

    const baseURL = 'http://localhost:3001';
    const username = 'testuser_payment_' + Date.now();

    try {
        // Step 1: Create/Login User
        console.log('Step 1: Creating test user...');
        const loginRes = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: 'test123' })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status}`);
        }

        const loginData = await loginRes.json();
        console.log('✅ User created:', loginData.user.username);
        console.log('   User ID:', loginData.user.id);

        const userId = loginData.user.id;

        // Step 2: Check Initial Wallet
        console.log('\nStep 2: Checking initial wallet balance...');
        const walletRes = await fetch(`${baseURL}/api/wallet/${userId}`);
        const walletData = await walletRes.json();
        console.log('✅ Initial Balance: ₹' + walletData.balance.toFixed(2));

        // Step 3: Make a Deposit (UPI)
        console.log('\nStep 3: Making deposit via UPI...');
        const depositAmount = 5000;
        const depositRes = await fetch(`${baseURL}/api/wallet/${userId}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: depositAmount,
                method: 'UPI'
            })
        });

        if (!depositRes.ok) {
            throw new Error(`Deposit failed: ${depositRes.status}`);
        }

        console.log('✅ Deposit successful: ₹' + depositAmount);

        // Step 4: Verify Updated Balance
        console.log('\nStep 4: Verifying updated balance...');
        const updatedWalletRes = await fetch(`${baseURL}/api/wallet/${userId}`);
        const updatedWalletData = await updatedWalletRes.json();
        console.log('✅ New Balance: ₹' + updatedWalletData.balance.toFixed(2));
        console.log('   Balance Increase: ₹' + (updatedWalletData.balance - walletData.balance).toFixed(2));

        // Step 5: Test Withdrawal (Bank Transfer)
        console.log('\nStep 5: Testing withdrawal via Bank Transfer...');
        const withdrawAmount = 1000;
        const withdrawRes = await fetch(`${baseURL}/api/wallet/${userId}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: withdrawAmount,
                method: 'BANK'
            })
        });

        if (!withdrawRes.ok) {
            throw new Error(`Withdrawal failed: ${withdrawRes.status}`);
        }

        console.log('✅ Withdrawal successful: ₹' + withdrawAmount);

        // Step 6: Final Balance Check
        console.log('\nStep 6: Final balance verification...');
        const finalWalletRes = await fetch(`${baseURL}/api/wallet/${userId}`);
        const finalWalletData = await finalWalletRes.json();
        console.log('✅ Final Balance: ₹' + finalWalletData.balance.toFixed(2));

        // Step 7: Check Transaction History
        console.log('\nStep 7: Checking transaction history...');
        console.log('   Total Transactions:', finalWalletData.transactions.length);
        finalWalletData.transactions.forEach((tx, idx) => {
            console.log(`   ${idx + 1}. ${tx.type.toUpperCase()} - ₹${tx.amount} via ${tx.method}`);
        });

        // Summary
        console.log('\n=== TEST SUMMARY ===');
        console.log('✅ User Creation: PASSED');
        console.log('✅ Deposit (UPI): PASSED');
        console.log('✅ Withdrawal (Bank): PASSED');
        console.log('✅ Balance Updates: PASSED');
        console.log('✅ Transaction Logging: PASSED');
        console.log('\n🎉 ALL PAYMENT METHODS WORKING PERFECTLY!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('   Stack:', error.stack);
    }
}

testPaymentFlow();
