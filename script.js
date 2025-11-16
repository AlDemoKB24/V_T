const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');


let tasks = [];
let currentFilter = 'все';

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
    
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {...task, completed: !task.completed};
        }
        return task;
    });
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
renderTasks();