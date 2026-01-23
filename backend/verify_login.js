const fetch = require('node-fetch');

(async () => {
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'randomuser99', password: 'password99' })
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
})();
