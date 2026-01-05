 const tasks = [
    { id: 'm1', text: 'Face Wash 🧼', time: 'morning' },
    { id: 'm2', text: 'Moisturizer & SPF ☀️', time: 'morning' },
    { id: 'l1', text: '3.5L Hydration 💧', time: 'always' },
    { id: 'n1', text: 'Deep Cleansing 🧴', time: 'night' },
    { id: 'n2', text: 'Retinol Recovery ✨', time: 'night' }
];

function saveUserName() {
    const name = document.getElementById('user-name-input').value;
    if(!name) return;
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
    if(id === 'calendar') renderCalendar();
}

function updateUI() {
    const hr = new Date().getHours();
    const container = document.getElementById('task-container');
    container.innerHTML = '';
    
    tasks.filter(t => (t.time === 'always') || (hr < 14 && t.time === 'morning') || (hr >= 14 && t.time === 'night'))
    .forEach(task => {
        const isChecked = localStorage.getItem('v7_'+task.id) === 'true';
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
    localStorage.setItem('v7_'+id, el.checked);
    updateUI();
}

function updateProgress() {
    let done = 0;
    tasks.forEach(t => { if(localStorage.getItem('v7_'+t.id) === 'true') done++; });
    const pct = Math.round((done / tasks.length) * 100);
    document.getElementById('ring-bar').style.strokeDashoffset = 502 - (502 * pct) / 100;
    document.getElementById('pct-val').innerText = pct + "%";

    if(pct === 100 && localStorage.getItem('v7_lastDone') !== new Date().toDateString()) {
        localStorage.setItem('v7_lastDone', new Date().toDateString());
        let s = parseInt(localStorage.getItem('v7_streak') || 0) + 1;
        localStorage.setItem('v7_streak', s);
        saveHistory(true);
        confetti({ particleCount: 200, spread: 80 });
        document.body.style.background = "#001a0a"; // Victory Glow
        setTimeout(() => document.body.style.background = "#000", 2000);
    }
}

function renderCalendar() {
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('v7_history') || "{}");
    const today = new Date().getDate();
    for(let i=1; i<=31; i++) {
        const d = new Date(2026, 0, i);
        const day = document.createElement('div');
        day.className = 'cal-day ' + (history[d.toDateString()] || '');
        if(d < new Date().setHours(0,0,0,0) && !history[d.toDateString()]) day.className += ' red';
        day.innerText = i;
        grid.appendChild(day);
    }
}

function saveHistory(success) {
    let history = JSON.parse(localStorage.getItem('v7_history') || "{}");
    history[new Date().toDateString()] = success ? 'green' : 'red';
    localStorage.setItem('v7_history', JSON.stringify(history));
}

function initialize() {
    const name = localStorage.getItem('v7_user');
    if(!name) {
        document.getElementById('setup-modal').style.display = 'flex';
    } else {
        document.getElementById('setup-modal').style.display = 'none';
        document.getElementById('user-display').innerText = name + " ARCHITECT";
        
        // Level Logic
        const streak = parseInt(localStorage.getItem('v7_streak') || 0);
        let level = "LEVEL 1: ROOKIE";
        if(streak >= 7) level = "LEVEL 2: WARRIOR";
        if(streak >= 30) level = "LEVEL 3: GOD ARCHITECT";
        document.getElementById('level-badge').innerText = level;
    }
    updateUI();
}

window.onload = initialize;