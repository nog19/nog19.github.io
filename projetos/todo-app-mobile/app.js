
// estados
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let deleteTaskId = null;
let searchQuery = '';

// elementos
const elements = {
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    addFirstBtn: document.getElementById('addFirstBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalIcon: document.getElementById('modalIcon'),
    modalClose: document.getElementById('modalClose'),
    taskForm: document.getElementById('taskForm'),
    taskId: document.getElementById('taskId'),
    taskTitle: document.getElementById('taskTitle'),
    taskCategory: document.getElementById('taskCategory'),
    taskDueDate: document.getElementById('taskDueDate'),
    cancelBtn: document.getElementById('cancelBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    confirmOverlay: document.getElementById('confirmOverlay'),
    confirmCancel: document.getElementById('confirmCancel'),
    confirmDelete: document.getElementById('confirmDelete'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    searchBtn: document.getElementById('searchBtn'),
    searchBar: document.getElementById('searchBar'),
    searchInput: document.getElementById('searchInput'),
    closeSearch: document.getElementById('closeSearch'),
    // resumo
    totalCount: document.getElementById('totalCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    // filtro
    filterTitle: document.getElementById('filterTitle'),
    sectionCount: document.getElementById('sectionCount'),
    // páginas filtradas
    tabAll: document.getElementById('tabAll'),
    tabActive: document.getElementById('tabActive'),
    tabCompleted: document.getElementById('tabCompleted'),
};

// inicialização
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
    updateSummary();
}

// amarzenamento local
function loadTasks() {
    try {
        const stored = localStorage.getItem('todoTasks');
        if (stored) {
            tasks = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading tasks:', e);
        tasks = [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving tasks:', e);
        showToast('Erro ao salvar tarefas');
    }
}

// eventos e interações
function setupEventListeners() {
    // adicona botão tarefa
    elements.addTaskBtn.addEventListener('click', openAddModal);
    
    // se vazio, botão de adicionar primeira tarefa
    if (elements.addFirstBtn) {
        elements.addFirstBtn.addEventListener('click', openAddModal);
    }
    
    // modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });
    
    // formulário
    elements.taskForm.addEventListener('submit', handleFormSubmit);
    
    // delete
    elements.deleteBtn.addEventListener('click', () => {
        if (editingTaskId) {
            deleteTaskId = editingTaskId;
            elements.confirmOverlay.classList.add('active');
        }
    });
    elements.confirmCancel.addEventListener('click', () => {
        elements.confirmOverlay.classList.remove('active');
        deleteTaskId = null;
    });
    elements.confirmDelete.addEventListener('click', confirmDelete);
    
    // filtos 
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentFilter = tab.dataset.filter;
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateFilterTitle();
            renderTasks();
        });
    });
    
    // pesquisa
    elements.searchBtn.addEventListener('click', () => {
        elements.searchBar.classList.toggle('active');
        if (elements.searchBar.classList.contains('active')) {
            elements.searchInput.focus();
        }
    });
    elements.closeSearch.addEventListener('click', () => {
        elements.searchBar.classList.remove('active');
        searchQuery = '';
        elements.searchInput.value = '';
        renderTasks();
    });
    elements.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });
}

// update do titulo de filtragem
function updateFilterTitle() {
    const titles = {
        all: 'Todas as tarefas',
        active: 'Tarefas ativas',
        completed: 'Tarefas concluídas'
    };
    elements.filterTitle.textContent = titles[currentFilter];
}

// exibição de tarefas
function renderTasks() {
    const filtered = filterTasks(tasks);
    
    // filtragem com base na pesquisa
    const searched = searchQuery 
        ? filtered.filter(t => t.title.toLowerCase().includes(searchQuery))
        : filtered;
    
    // seção de contagem
    elements.sectionCount.textContent = searched.length;
    
    if (searched.length === 0) {
        elements.taskList.innerHTML = '';
        elements.emptyState.classList.add('visible');
    } else {
        elements.emptyState.classList.remove('visible');
        elements.taskList.innerHTML = searched.map((task, index) => renderTaskCard(task, index)).join('');
        
        // eventos para marcar como concluida
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(checkbox.dataset.id);
                toggleTask(id);
            });
        });
        
        // eventos para edição
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                openEditModal(id);
            });
            
            // swipe(delizar) de delete
            let startX = 0;
            let currentX = 0;
            
            card.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            
            card.addEventListener('touchmove', (e) => {
                currentX = e.touches[0].clientX;
                const diff = startX - currentX;
                if (diff > 50) {
                    card.classList.add('swiping');
                } else if (diff < -50) {
                    card.classList.remove('swiping');
                }
            });
            
            card.addEventListener('touchend', () => {
                const diff = startX - currentX;
                if (diff > 100) {
                    deleteTaskId = parseInt(card.dataset.id);
                    elements.confirmOverlay.classList.add('active');
                }
                setTimeout(() => card.classList.remove('swiping'), 300);
            });
        });
    }
}

function renderTaskCard(task, index) {
    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
    const categoryClass = task.category || 'other';
    const categoryLabel = getCategoryLabel(task.category);
    
    return `
        <div class="task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${task.id}" style="animation-delay: ${index * 0.05}s">
            <div class="checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${task.category ? `<span class="category-badge ${categoryClass}">${categoryLabel}</span>` : ''}
                    ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${formatDate(task.dueDate)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

function filterTasks(taskList) {
    switch (currentFilter) {
        case 'active':
            return taskList.filter(t => !t.completed);
        case 'completed':
            return taskList.filter(t => t.completed);
        default:
            return taskList;
    }
}

function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    elements.totalCount.textContent = total;
    elements.activeCount.textContent = active;
    elements.completedCount.textContent = completed;
    
    // att barra de progresso
    elements.progressFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
    
    // att quantidade nas abas de filtro
    elements.tabAll.textContent = total;
    elements.tabActive.textContent = active;
    elements.tabCompleted.textContent = completed;
}

// ações 
function addTask(title, category, dueDate) {
    const task = {
        id: Date.now(),
        title: title.trim(),
        category: category,
        dueDate: dueDate || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateSummary();
    showToast('Tarefa adicionada com sucesso! ✨');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateSummary();
        if (task.completed) {
            showToast('Tarefa concluída! 🎉');
        }
    }
}

function updateTask(id, title, category, dueDate) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.title = title.trim();
        task.category = category;
        task.dueDate = dueDate || '';
        saveTasks();
        renderTasks();
        updateSummary();
        showToast('Tarefa atualizada! ✏️');
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateSummary();
    showToast('Tarefa excluída! 🗑️');
}

function confirmDelete() {
    if (deleteTaskId) {
        deleteTask(deleteTaskId);
        elements.confirmOverlay.classList.remove('active');
        deleteTaskId = null;
        closeModal();
    }
}

// modal de criação/edição
function openAddModal() {
    editingTaskId = null;
    elements.modalTitle.textContent = 'Nova Tarefa';
    elements.modalIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>';
    elements.taskId.value = '';
    elements.taskTitle.value = '';
    elements.taskCategory.value = '';
    elements.taskDueDate.value = '';
    elements.deleteBtn.classList.remove('visible');
    elements.modalOverlay.classList.add('active');
    setTimeout(() => elements.taskTitle.focus(), 300);
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    elements.modalTitle.textContent = 'Editar Tarefa';
    elements.modalIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    elements.taskId.value = task.id;
    elements.taskTitle.value = task.title;
    elements.taskCategory.value = task.category || '';
    elements.taskDueDate.value = task.dueDate || '';
    elements.deleteBtn.classList.add('visible');
    elements.modalOverlay.classList.add('active');
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    editingTaskId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = elements.taskTitle.value.trim();
    const category = elements.taskCategory.value;
    const dueDate = elements.taskDueDate.value;
    
    if (!title) {
        showToast('Por favor, digite um título');
        return;
    }
    
    if (editingTaskId) {
        updateTask(editingTaskId, title, category, dueDate);
    } else {
        addTask(title, category, dueDate);
    }
    
    closeModal();
}

// utilidades
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryLabel(category) {
    const labels = {
        personal: 'Pessoal',
        work: 'Trabalho',
        shopping: 'Compras',
        health: 'Saúde',
        study: 'Estudos',
        other: 'Outro'
    };
    return labels[category] || 'Outro';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Amanhã';
    }
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// inicio app
document.addEventListener('DOMContentLoaded', () => {
    init();
    updateFilterTitle();
    
    // fun offline
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration.scope);
                })
                .catch((error) => {
                    console.log('SW registration failed:', error);
                });
        });
    }
});
