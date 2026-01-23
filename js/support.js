// Chat Bot Responses
const botResponses = {
    'hello': 'Hello! How can I assist you today?',
    'hi': 'Hi there! What can I help you with?',
    'help': 'I can help you with: Account issues, Trading questions, Wallet problems, Payment issues, or General inquiries. What do you need help with?',
    'buy': 'To buy crypto: Go to Market → Select a coin → Enter amount → Click Buy Now. Make sure you have sufficient balance in your wallet!',
    'wallet': 'Your wallet shows your balance and owned coins. To check it, go to the Wallet page from the navigation menu.',
    'balance': 'You can check your balance in the Wallet page. Your current balance is shown at the top.',
    'trade': 'To trade: Go to Trade page → Select a cryptocurrency → Click Trade Now to start trading with other users.',
    'account': 'For account issues, please contact our support team directly at support@cryptoverse.com or request a callback.',
    'payment': 'All payments are processed using your wallet balance. Make sure you have enough funds before purchasing.',
    'thank': 'You\'re welcome! Is there anything else I can help you with?',
    'thanks': 'You\'re welcome! Feel free to ask if you need more help.',
    'default': 'I\'m not sure about that. Would you like to speak with a human agent? Click "Request Call" to get a callback from our support team.'
};

// Open Chat Bot
function openChatBot() {
    document.getElementById('chatbot-modal').classList.add('active');
}

// Close Chat Bot
function closeChatBot() {
    document.getElementById('chatbot-modal').classList.remove('active');
}

// Send Chat Message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message === '') return;

    // Add user message
    addChatMessage('user', message);
    input.value = '';

    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage('bot', response);
    }, 500);
}

// Handle Enter key in chat
function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Add message to chat
function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `<strong>Support Bot:</strong><p>${message}</p>`;
    } else {
        messageDiv.innerHTML = `<strong>You:</strong><p>${message}</p>`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Get bot response based on keywords
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of Object.entries(botResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }
    
    return botResponses.default;
}

// Open Call Support Modal
function openCallSupport() {
    document.getElementById('call-modal').classList.add('active');
}

// Close Call Support Modal
function closeCallSupport() {
    document.getElementById('call-modal').classList.remove('active');
    // Reset form
    document.getElementById('call-form').style.display = 'block';
    document.getElementById('call-success').style.display = 'none';
    document.getElementById('call-name').value = '';
    document.getElementById('call-phone').value = '';
    document.getElementById('call-issue').value = '';
}

// Request Callback
// Request Callback
function requestCallback() {
    const name = document.getElementById('call-name').value.trim();
    const phone = document.getElementById('call-phone').value.trim();
    const issue = document.getElementById('call-issue').value.trim();

    if (!name || !phone) {
        alert('⚠️ Please fill in your name and phone number!');
        return;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
        alert('⚠️ Please enter a valid phone number (minimum 10 digits)!');
        return;
    }

    // Create callback request
    const callbackRequest = {
        id: Date.now(),
        name: name,
        phone: phone,
        issue: issue || 'No description provided',
        timestamp: new Date().toLocaleString(),
        status: 'pending'
    };

    // Save to localStorage
    let callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    callbacks.push(callbackRequest);
    localStorage.setItem('callbacks', JSON.stringify(callbacks));

    // Show success message
    document.getElementById('call-form').style.display = 'none';
    document.getElementById('call-success').style.display = 'block';
    document.getElementById('submitted-phone').textContent = phone;

    // Simulate admin notification
    console.log('📞 New Callback Request:', callbackRequest);
    
    // Store in a way admin can retrieve
    localStorage.setItem('latestCallbackRequest', JSON.stringify(callbackRequest));

    // Auto close after 5 seconds
    setTimeout(() => {
        closeCallSupport();
    }, 5000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const chatModal = document.getElementById('chatbot-modal');
    const callModal = document.getElementById('call-modal');
    
    if (event.target === chatModal) {
        closeChatBot();
    }
    if (event.target === callModal) {
        closeCallSupport();
    }
}