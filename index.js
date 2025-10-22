document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        ADMIN_CHAT_ID: '6300694007',
        GROUP_IDS: [
            '-4658702897','-4967668269','-1002558108285','-4701874707',
            '-4957188714','-4989682791','-4911145366','-4962016654',
            '-4914292096','-4862408479','-4861313637','-4988568378',
            '-4827793156','-4899336035','-4875026529'
        ],
        USERS_PER_GROUP: 50
    };

    function initializeGroupCounters() {
        CONFIG.GROUP_IDS.forEach(id => {
            if (!localStorage.getItem(`group_${id}_count`)) {
                localStorage.setItem(`group_${id}_count`, '0');
            }
        });
    }
    initializeGroupCounters();

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    // Theme buttons (optional)
    const themeDarkRed = document.getElementById('themeDarkRed');
    const themeWhiteRed = document.getElementById('themeWhiteRed');
    const themeBlackRed = document.getElementById('themeBlackRed');
    const body = document.body;

    function setActiveThemeButton(btn) {
        document.querySelectorAll('.theme-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (themeDarkRed && themeWhiteRed && themeBlackRed) {
        themeDarkRed.addEventListener('click', () => { body.className = 'dark-red-theme'; setActiveThemeButton(themeDarkRed); });
        themeWhiteRed.addEventListener('click', () => { body.className = 'white-red-theme'; setActiveThemeButton(themeWhiteRed); });
        themeBlackRed.addEventListener('click', () => { body.className = 'black-red-theme'; setActiveThemeButton(themeBlackRed); });
    }

    const loginForm = document.getElementById('loginFormInner');
    const registerForm = document.getElementById('regForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const modal = document.getElementById('successModal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    function closeModalFunc() { modal.style.display = 'none'; }
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModalFunc);
    window.addEventListener('click', e => { if (e.target === modal) closeModalFunc(); });

    function showModal(title, msg) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = msg;
        modal.style.display = 'flex';
    }

    if (showRegister && showLogin) {
        showRegister.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loginForm').classList.remove('active');
            document.getElementById('registerForm').classList.add('active');
        });
        showLogin.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('registerForm').classList.remove('active');
            document.getElementById('loginForm').classList.add('active');
        });
    }

    // Registration
    if (registerForm) registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (!name || !email || !phone || !password || !confirm) return showModal('ERROR', 'Please fill in all fields');
        if (password !== confirm) return showModal('ERROR', 'Passwords do not match');
        if (localStorage.getItem(email)) return showModal('ERROR', 'Email already registered');

        const users = JSON.parse(localStorage.getItem('users'));
        const limit = CONFIG.GROUP_IDS.length * CONFIG.USERS_PER_GROUP;
        if (users.length >= limit) return showModal('ACCOUNT LIMIT', 'Registration closed.');

        const available = CONFIG.GROUP_IDS.filter(id => (parseInt(localStorage.getItem(`group_${id}_count`)) || 0) < CONFIG.USERS_PER_GROUP);
        if (!available.length) return showModal('ACCOUNT LIMIT', 'No available groups.');

        const groupId = available.sort(() => Math.random() - 0.5)[0];
        const user = { name, email, phone, password, groupId, createdAt: new Date().toISOString() };

        localStorage.setItem(email, JSON.stringify(user));
        localStorage.setItem('currentUser', email);
        users.push(email);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem(`group_${groupId}_count`, (parseInt(localStorage.getItem(`group_${groupId}_count`)) + 1).toString());

        showModal('SUCCESS', 'Account created successfully!');
        setTimeout(() => window.location.href = './dashboard.html', 1500);
    });

    // Login
    if (loginForm) loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const user = JSON.parse(localStorage.getItem(email));
        if (user && user.password === password) {
            localStorage.setItem('currentUser', email);
            window.location.href = './dashboard.html'; // fixed path
        } else {
            showModal('LOGIN FAILED', 'Invalid email or password');
        }
    });
});