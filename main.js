 const tasks = [
    { id: 'm1', text: 'Face Wash 🧼', time: 'morning' },
    { id: 'm2', text: 'Moisturizer & SPF ☀️', time: 'morning' },
    { id: 'l1', text: '3.5L Hydration 💧', time: 'always' },
    { id: 'n1', text: 'Deep Cleansing 🧴', time: 'night' },
    { id: 'n2', text: 'Retinol Recovery ✨', time: 'night' }
];

// ─── FIX: loadPhoto was referenced in HTML but never defined ───────────────────
function loadPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('profile-img');
        img.src = e.target.result;
        localStorage.setItem('v7_photo', e.target.result);
    };
    reader.readAsDataURL(file);
}

// ─── FIX: sendMsg was referenced in HTML but never defined ────────────────────
function sendMsg() {
    const input = document.getElementById('chat-input');
    const box   = document.getElementById('chat-box');
    const msg   = input.value.trim();
    if (!msg) return;

    // Render user message
    const userBubble = document.createElement('div');
    userBubble.className = 'user-msg';
    userBubble.innerText = msg;
    box.appendChild(userBubble);
    input.value = '';
    box.scrollTop = box.scrollHeight;

    // Thinking indicator
    const thinking = document.createElement('div');
    thinking.className = 'ai-msg';
    thinking.innerText = '...';
    box.appendChild(thinking);
    box.scrollTop = box.scrollHeight;

    // Simple rule-based AI replies (no external API needed)
    const replies = {
        streak:      () => `Your current streak is ${localStorage.getItem('v7_streak') || 0} days. Keep going!`,
        progress:    () => `You've completed ${getCompletedCount()} of ${tasks.length} tasks today.`,
        level:       () => document.getElementById('level-badge').innerText,
        hello:       () => 'System online. Ready to optimize your protocol, Architect.',
        hi:          () => 'Greetings, Architect. All systems operational.',
        help:        () => 'Ask me about: streak, progress, level, tasks, or motivation.',
        task:        () => 'Stay consistent. Every task you complete builds the streak.',
        motivation:  () => '💪 You are the architect of your own skin. Build it deliberately.',
        reset:       () => { if(confirm('Reset ALL data?')) { localStorage.clear(); location.reload(); } return 'Resetting...'; },
    };

    setTimeout(() => {
        let response = 'Command received. Keep executing, Architect. 🔥';
        const lower = msg.toLowerCase();
        for (const [key, fn] of Object.entries(replies)) {
            if (lower.includes(key)) { response = fn(); break; }
        }
        thinking.innerText = response;
        box.scrollTop = box.scrollHeight;
    }, 600);
}

function getCompletedCount() {
    return tasks.filter(t => localStorage.getItem('v7_' + t.id) === 'true').length;
}

function saveUserName() {
    const name = document.getElementById('user-name-input').value.trim();
    if (!name) return;
    localStorage.setItem('v7_user', name.toUpperCase());
    document.getElementById('setup-modal').style.display = 'none';
    confetti({ particleCount: 150, spread: 70 });
    initialize();
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('.dock i').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active-tab');
    el.classList.add('active');
    if (id === 'calendar') renderCalendar();
}

function updateUI() {
    const hr        = new Date().getHours();
    const container = document.getElementById('task-container');
    container.innerHTML = '';

    tasks.filter(t =>
        t.time === 'always' ||
        (hr < 14 && t.time === 'morning') ||
        (hr >= 14 && t.time === 'night')
    ).forEach(task => {
        const isChecked = localStorage.getItem('v7_' + task.id) === 'true';
        container.innerHTML += `
            <div class="task-row ${isChecked ? 'done' : ''}">
                <input type="checkbox" id="${task.id}" ${isChecked ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                <label for="${task.id}">${task.text}</label>
            </div>
        `;
    });
    updateProgress();
}

function toggleTask(id) {
    const el = document.getElementById(id);
    localStorage.setItem('v7_' + id, el.checked);
    updateUI();
}

function updateProgress() {
    let done = 0;
    tasks.forEach(t => { if (localStorage.getItem('v7_' + t.id) === 'true') done++; });
    const pct = Math.round((done / tasks.length) * 100);
    document.getElementById('ring-bar').style.strokeDashoffset = 502 - (502 * pct) / 100;
    document.getElementById('pct-val').innerText = pct + '%';

    if (pct === 100 && localStorage.getItem('v7_lastDone') !== new Date().toDateString()) {
        localStorage.setItem('v7_lastDone', new Date().toDateString());
        let s = parseInt(localStorage.getItem('v7_streak') || 0) + 1;
        localStorage.setItem('v7_streak', s);
        saveHistory(true);
        confetti({ particleCount: 200, spread: 80 });
        document.body.style.background = '#001a0a';
        setTimeout(() => document.body.style.background = '#000', 2000);
    }
}

// ─── FIX: Calendar was hardcoded to January 2026 ──────────────────────────────
function renderCalendar() {
    const grid    = document.getElementById('cal-grid');
    grid.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('v7_history') || '{}');

    const now        = new Date();
    const year       = now.getFullYear();
    const month      = now.getMonth();           // current month (0-indexed)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // correct day count

    for (let i = 1; i <= daysInMonth; i++) {
        const d   = new Date(year, month, i);
        const day = document.createElement('div');
        const key = d.toDateString();
        day.className = 'cal-day ' + (history[key] || '');
        if (d < new Date().setHours(0, 0, 0, 0) && !history[key]) day.className += ' red';
        day.innerText = i;
        grid.appendChild(day);
    }

    // Update streak display
    const streakEl = document.getElementById('streak-val');
    if (streakEl) streakEl.innerText = localStorage.getItem('v7_streak') || 0;
}

function saveHistory(success) {
    let history = JSON.parse(localStorage.getItem('v7_history') || '{}');
    history[new Date().toDateString()] = success ? 'green' : 'red';
    localStorage.setItem('v7_history', JSON.stringify(history));
}

function initialize() {
    const name = localStorage.getItem('v7_user');
    if (!name) {
        document.getElementById('setup-modal').style.display = 'flex';
    } else {
        document.getElementById('setup-modal').style.display = 'none';
        document.getElementById('user-display').innerText = name + ' ARCHITECT';

        // Restore saved photo
        const savedPhoto = localStorage.getItem('v7_photo');
        if (savedPhoto) document.getElementById('profile-img').src = savedPhoto;

        // Level logic
        const streak = parseInt(localStorage.getItem('v7_streak') || 0);
        let level = 'LEVEL 1: ROOKIE';
        if (streak >= 7)  level = 'LEVEL 2: WARRIOR';
        if (streak >= 30) level = 'LEVEL 3: GOD ARCHITECT';
        document.getElementById('level-badge').innerText = level;
    }
    updateUI();
}

window.onload = initialize;
