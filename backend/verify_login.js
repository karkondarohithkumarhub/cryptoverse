const fetch = require('node-fetch');

const username = process.env.TEST_USERNAME || process.argv[2] || 'testuser';
const password = process.env.TEST_PASSWORD || process.argv[3] || '123456';

(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      console.error('Login failed. Status:', response.status);
      const text = await response.text();
      console.error('Response:', text);
      process.exit(1);
    }

    const data = await response.json();
    console.log('Login successful for:', data.user && data.user.username ? data.user.username : username);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
