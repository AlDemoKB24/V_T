const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'все';
let draggedTask = null;

!localStorage.tasks ? tasks = [] : tasks = JSON.parse(localStorage.getItem('tasks'));
const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}


function loadTasks(){
    const saveLocalStorage = localStorage.getItem('tasks')
    if (saveLocalStorage) {
        tasks = JSON.parse(saveLocalStorage);
    }
}

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Введите текст задачи!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    tasks.push(task);
    
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {...task, completed: !task.completed};
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

function renderTasks() {

    taskList.innerHTML = '';

    if (!tasks.length) {
        taskList.innerHTML = '<li style="text-align: center;">Нет задач</li>';
        return;
    }

    let filteredTasks = tasks;
    if (currentFilter === 'активные') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'выполненные') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.draggable = true;
        li.dataset.id = task.id;
        
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);
        
        if (task.completed) {
            li.style.opacity = '0.6';
            li.style.textDecoration = 'line-through';
        }
        
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleComplete(${task.id})">
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}


function handleDragStart(e) {
    draggedTask = this;
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedTask !== this) {
        const fromId = parseInt(draggedTask.dataset.id);
        const toId = parseInt(this.dataset.id);
        
        const fromIndex = tasks.findIndex(task => task.id === fromId);
        const toIndex = tasks.findIndex(task => task.id === toId);
        
        [tasks[fromIndex], tasks[toIndex]] = [tasks[toIndex], tasks[fromIndex]];
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
    return false;
}

function handleDragEnd() {
    this.style.opacity = '1';
    draggedTask = null;
}

function filterTasks(filterType) {
    currentFilter = filterType;
    
    renderTasks();
}

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        filterTasks(this.textContent.toLowerCase());
    });
});

tasks = [];
loadTasks();
renderTasks();