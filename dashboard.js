document.addEventListener('DOMContentLoaded', function() {
    // === CONFIGURATION ===
    const BOT_TOKEN = '7285369349:AAEqC1zaBowR7o3rq2_J2ewPRwUUaNE7KKM';
    const FIXED_PAIRING_CODE = 'PHIS-2025';

    // === USER VALIDATION ===
    const currentUserEmail = localStorage.getItem('currentUser');
    let currentUser = null;
    let USER_GROUP_ID = null;

    try {
        currentUser = JSON.parse(localStorage.getItem(currentUserEmail));
        USER_GROUP_ID = currentUser?.groupId;
    } catch (err) {
        console.error("Failed to load user:", err);
    }

    if (!currentUser || !USER_GROUP_ID) {
        console.warn("⚠️ No valid user or group found in localStorage.");
        alert("Account error: Please log in again.");
        window.location.href = "index.html";
        return;
    }

    // === DOM ELEMENTS ===
    const get = id => document.getElementById(id);
    const startDeployBtn = get('startDeployBtn');
    const passcodeModal = get('passcodeModal');
    const whatsappModal = get('whatsappModal');
    const passcodeInput = get('passcodeInput');
    const submitPasscodeBtn = get('submitPasscodeBtn');
    const passcodeStatus = get('passcodeStatus');
    const whatsappInput = get('whatsappInput');
    const submitWhatsappBtn = get('submitWhatsappBtn');
    const pairingCodeContainer = get('pairingCodeContainer');
    const pairingCode = get('pairingCode');
    const copyCodeBtn = get('copyCodeBtn');
    const whatsappStatus = get('whatsappStatus');
    const consoleOutput = get('consoleOutput');
    const clearConsoleBtn = get('clearConsoleBtn');
    const stopBotBtn = get('stopBotBtn');
    const restartBotBtn = get('restartBotBtn');
    const logoutBtn = get('logoutBtn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const closeButtons = document.querySelectorAll('.close');

    // === STATE ===
    let connectedNumber = null;
    let isBotRunning = false;

    // === SET USER INFO ===
    if (currentUser?.name) {
        get('username').textContent = currentUser.name;
        get('welcomeMessage').textContent = `Welcome back, ${currentUser.name}`;
    }

    // === THEME HANDLING ===
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${savedTheme}-theme`;

    themeBtns.forEach(btn => {
        if (btn.dataset.theme === savedTheme) btn.classList.add('active');

        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.body.className = `${theme}-theme`;
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('theme', theme);
        });
    });

    // === EVENT LISTENERS ===
    startDeployBtn?.addEventListener('click', () => {
        passcodeModal.style.display = 'flex';
    });

    passcodeInput?.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
    });

    submitPasscodeBtn?.addEventListener('click', verifyPasscode);
    submitWhatsappBtn?.addEventListener('click', pairWhatsAppNumber);
    copyCodeBtn?.addEventListener('click', copyPairingCode);
    clearConsoleBtn?.addEventListener('click', () => {
        consoleOutput.innerHTML = '<div class="console-line">Console cleared</div>';
    });
    stopBotBtn?.addEventListener('click', stopBot);
    restartBotBtn?.addEventListener('click', restartBot);

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', event => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // === FUNCTIONS ===
    function addConsoleLine(text, type = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = text;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-${type}`;
        element.style.display = 'block';
    }

    async function verifyPasscode() {
        const passcode = passcodeInput.value.trim();
        if (passcode.length !== 9) {
            return showStatus(passcodeStatus, 'Please enter a 9-digit passcode', 'error');
        }

        const firstThree = passcode.substring(0, 3);
        if (firstThree.includes('4')) {
            showStatus(passcodeStatus, 'Passcode verified successfully!', 'success');
            setTimeout(() => {
                passcodeModal.style.display = 'none';
                startDeploymentProcess();
            }, 1500);
        } else {
            showStatus(passcodeStatus, 'Invalid passcode. Get it from Telegram bot.', 'error');
        }
    }

    async function startDeploymentProcess() {
        addConsoleLine('Starting deployment process...', 'info');

        const steps = [
            { text: 'Initializing system...', delay: 1000 },
            { text: 'Connecting to servers...', delay: 1500 },
            { text: 'Authenticating credentials...', delay: 2000 },
            { text: 'Downloading required packages...', delay: 2500 },
            { text: 'Verifying dependencies...', delay: 2000 },
            { text: 'Building deployment package...', delay: 3000 },
            { text: 'Deployment ready!', delay: 1000, type: 'success' },
            { text: 'Please pair your WhatsApp number to continue', delay: 0, type: 'info' }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            addConsoleLine(step.text, step.type || 'info');
        }

        whatsappModal.style.display = 'flex';
    }

    async function pairWhatsAppNumber() {
        const phoneNumber = whatsappInput.value.trim();
        if (!phoneNumber) return showStatus(whatsappStatus, 'Please enter your WhatsApp number', 'error');

        connectedNumber = phoneNumber;
        showStatus(whatsappStatus, 'Pairing your WhatsApp number...', 'info');

        try {
            await sendTelegramMessage(`/pair ${phoneNumber}`);
            pairingCode.textContent = FIXED_PAIRING_CODE;
            pairingCodeContainer.style.display = 'block';
            showStatus(whatsappStatus, 'WhatsApp number paired successfully!', 'success');

            setTimeout(() => {
                addConsoleLine('╭━━━━━━━━━━━━━━━━━━━╮', 'info');
                addConsoleLine('│ Connected successfully │', 'info');
                addConsoleLine('╰━━━━━━━━━━━━━━━━━━━╯', 'info');
                addConsoleLine('Your bot is now live!', 'success');

                whatsappModal.style.display = 'none';
                isBotRunning = true;
                stopBotBtn.style.display = 'inline-flex';
                restartBotBtn.style.display = 'inline-flex';
            }, 30000);
        } catch (error) {
            console.error('Error:', error);
            showStatus(whatsappStatus, 'Failed to pair WhatsApp number', 'error');
        }
    }

    async function stopBot() {
        if (!connectedNumber) return;
        addConsoleLine('Stopping bot...', 'info');
        try {
            await sendTelegramMessage(`/delpair ${connectedNumber}`);
            addConsoleLine('Bot stopped successfully', 'success');
            isBotRunning = false;
            stopBotBtn.style.display = 'none';
            restartBotBtn.style.display = 'none';
            pairingCodeContainer.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            addConsoleLine('Failed to stop bot', 'error');
        }
    }

    async function restartBot() {
        if (!connectedNumber) return;
        addConsoleLine('Restarting bot...', 'info');
        try {
            await sendTelegramMessage(`/delpair ${connectedNumber}`);
            addConsoleLine('Bot stopped', 'info');

            addConsoleLine('Waiting 10 seconds...', 'info');
            await new Promise(r => setTimeout(r, 10000));

            addConsoleLine('Starting bot again...', 'info');
            await sendTelegramMessage(`/pair ${connectedNumber}`);

            pairingCode.textContent = FIXED_PAIRING_CODE;
            pairingCodeContainer.style.display = 'block';
            addConsoleLine('Bot restarted successfully', 'success');
        } catch (error) {
            console.error('Error:', error);
            addConsoleLine('Failed to restart bot', 'error');
        }
    }

    function copyPairingCode() {
        navigator.clipboard.writeText(pairingCode.textContent)
            .then(() => {
                const originalText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
                setTimeout(() => copyCodeBtn.innerHTML = originalText, 2000);
            })
            .catch(err => console.error('Clipboard error:', err));
    }

    async function sendTelegramMessage(text) {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const payload = { chat_id: USER_GROUP_ID, text };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.description);
        return json;
    }

    // === INIT ===
    addConsoleLine('Deployment Console initialized', 'info');
});