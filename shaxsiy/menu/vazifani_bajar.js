// Barcha kerakli elementlarni olish
const taskForm = document.getElementById('taskForm');
const taskText = document.getElementById('taskText');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const totalCountEl = document.getElementById('totalCount');
const doneCountEl = document.getElementById('doneCount');
const pendingCountEl = document.getElementById('pendingCount');
const motivationModal = document.getElementById('motivationModal');
const motiText = document.getElementById('motiText');
const alertModal = document.getElementById('alertModal');
const alertText = document.getElementById('alertText');

// 🔑 O'ZGARISH: Yuklashda xatolik bo'lmasligi uchun ishonchli yuklash
let tasks = [];
try {
    const saved = localStorage.getItem('myTasks');
    if (saved) {
        tasks = JSON.parse(saved);
        console.log('✅ Vazifalar yuklandi:', tasks.length, 'ta');
    }
} catch (err) {
    console.error('❌ Saqlangan ma\'lumotni o\'qib bo\'lmadi:', err);
    tasks = [];
}
let currentFilter = 'all';

// Motivatsion gaplar ro'yxati
const motivationalTexts = [
    "Siz ajoyibsiz! Har bir kichik qadam katta natijaga olib keladi. Davom eting! 💪",
    "Ajoyib ish! Maqsadlaringizga bir qadam yaqinlashdingiz. 🚀",
    "Barakalla! O'z ustingizda ishlash hech qachon to'xtamang. 🌟",
    "Juda yaxshi! Intizom — muvaffaqiyat kaliti. Davom eting! 🔥",
    "Yaxshi uddaladingiz! Bugungi mehnatingiz ertangi muvaffaqiyatidir. 🌅",
    "Sizning imkoniyatlaringiz cheksiz! Ishda davom eting. ✨",
    "Mazkur natija — sizning sa'y-harakatlaringiz samarasi. 🎯",
    "Har bir tugallangan vazifa — bu g'alaba! G'alabalaringiz ko'p bo'lsin! 🏆"
];

// Sahifa yuklanganda ishlaydi
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    renderTasks();
    updateStats();
    startTimeChecker();
    if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});

// Bugungi sanani avtomatik kiritish
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    taskDate.value = today;
    taskDate.min = today;
}

// 🔑 O'ZGARISH: Ishonchli saqlash funksiyasi
function saveTasks() {
    try {
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        console.log('✅ Saqlandi. Jami:', tasks.length, 'ta');
    } catch (err) {
        console.error('❌ Saqlab bo\'lmadi:', err);
        alert("Diqqat: Vazifalarni saqlab bo'lmadi! Brauzer sozlamalarini tekshiring.");
    }
}

// HTML belgilardan himoya qilish
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sana formatini o'zgartirish
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('uz-UZ', options);
}

// Muhimlik darajasini tarjima qilish
function getPriorityLabel(priority) {
    const labels = {
        low: 'Oddiy',
        medium: "O'rtacha",
        high: 'Muhim'
    };
    return labels[priority] || priority;
}

// Vazifalarni ko'rsatish
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'done') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <div class="task-body">
                    <p class="task-name">${escapeHtml(task.text)}</p>
                    <div class="task-meta">
                        <span>📅 ${formatDate(task.date)}</span>
                        <span>⏰ ${task.time || 'Vaqt belgilanmagan'}</span>
                        <span class="priority-tag">${getPriorityLabel(task.priority)}</span>
                    </div>
                </div>
                <button class="delete-btn" data-id="${task.id}" title="O'chirish">
                    <i class="fas fa-times"></i>
                </button>
            `;
            taskList.appendChild(li);
        });
    }
    updateStats();
}

// Statistikani yangilash
function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;

    totalCountEl.textContent = total;
    doneCountEl.textContent = done;
    pendingCountEl.textContent = pending;
}

// Yangi vazifa qo'shish
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = taskText.value.trim();
    const date = taskDate.value;
    const time = taskTime.value;

    if (!text) {
        alert("Vazifa matnini kiriting!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        date: date,
        time: time,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // 🔑 Massivga qo'sh va darhol saqlash
    tasks.unshift(newTask);
    saveTasks(); // ← BU JUDA MUHIM!
    renderTasks();

    // Maydonlarni tozalash
    taskText.value = '';
    taskTime.value = '';
    taskText.focus();
});

// Vazifani bajarilgan deb belgilash / o'chirish
taskList.addEventListener('click', (e) => {
    const btn = e.target.closest('button, input');
    if (!btn) return;
    
    const id = parseInt(btn.dataset.id);
    if (!id) return;

    // Checkbox bosilganda
    if (btn.classList.contains('task-checkbox')) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const wasNotDone = !task.completed;
            task.completed = !task.completed;
            saveTasks(); // ← Darhol saqlash
            renderTasks();
            if (task.completed && wasNotDone) {
                showRandomMotivation();
            }
        }
    }

    // O'chirish tugmasi bosilganda
    if (btn.closest('.delete-btn')) {
        if (confirm("Vazifani o'chirishga ishonchingiz komilmi?")) {
            tasks = tasks.filter(t => t.id !== id);
            localStorage.removeItem(`notified_${id}`);
            saveTasks(); // ← Darhol saqlash
            renderTasks();
        }
    }
});

// Filtr tugmalari
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Bajarilganlarni tozalash
clearDoneBtn.addEventListener('click', () => {
    if (confirm('Barcha bajarilgan vazifalar o\'chirilsinmi?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks(); // ← Darhol saqlash
        renderTasks();
    }
});

// Tasodifiy motivatsion xabar ko'rsatish
function showRandomMotivation() {
    const randomText = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];
    motiText.textContent = randomText;
    motivationModal.classList.add('show');
}

// Motivatsion oynani yopish
function closeMotiModal() {
    motivationModal.classList.remove('show');
}

// Ogohlantirish oynasini yopish
function closeAlertModal() {
    alertModal.classList.remove('show');
}

// Vaqt yetganda ogohlantirish ko'rsatish
function showTimeNotification(task) {
    alertText.textContent = `"${task.text}" — vazifani bajarish vaqti keldi! ⏳`;
    alertModal.classList.add('show');

    if (Notification && Notification.permission === "granted") {
        new Notification("⏰ Vazifalarim", {
            body: `"${task.text}" — vaqt yetdi!`,
            icon: "https://cdn-icons-png.flaticon.com/512/3204/3204123.png"
        });
    }
}

// Vaqtni tekshirish tizimi
function startTimeChecker() {
    setInterval(() => {
        const now = new Date();
        tasks.forEach(task => {
            if (!task.completed && task.date && task.time) {
                const taskDateTime = new Date(`${task.date}T${task.time}`);
                const notificationKey = `notified_${task.id}`;
                
                if (now >= taskDateTime && !localStorage.getItem(notificationKey)) {
                    showTimeNotification(task);
                    localStorage.setItem(notificationKey, 'true');
                }
            }
        });
    }, 30000);
}

// ESC tugmasi bilan oynalarni yopish
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMotiModal();
        closeAlertModal();
    }
});

// Oynani yopishdan oldin oxirgi marta saqlash
window.addEventListener('beforeunload', () => {
    saveTasks();
});
