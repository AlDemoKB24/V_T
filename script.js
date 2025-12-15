const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const filterButtons = document.querySelectorAll('.filter-btn');
const categorySelect = document.getElementById('categorySelect');

const workTasksList = document.getElementById('work-tasks');
const homeTasksList = document.getElementById('home-tasks');
const hobbyTasksList = document.getElementById('hobby-tasks');

const workColumn = document.querySelector('.column:nth-child(1)');
const homeColumn = document.querySelector('.column:nth-child(2)');
const hobbyColumn = document.querySelector('.column:nth-child(3)');

let tasks = [];
let currentFilter = 'all';
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
    const category = categorySelect.value;
    
    if (taskText === '') {
        alert('Введите текст задачи!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        category: category,
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

function moveTaskToCategory(taskId, newCategory) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            category: newCategory
        };
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    workTasksList.innerHTML = '';
    homeTasksList.innerHTML = '';
    hobbyTasksList.innerHTML = '';

    if (!tasks.length) {
        workTasksList.innerHTML = '<div class="empty-placeholder">Нет задач</div>';
        workTasksList.classList.add('empty');
        return;
    }

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    const workTasks = filteredTasks.filter(task => task.category === 'work');
    const homeTasks = filteredTasks.filter(task => task.category === 'home');
    const hobbyTasks = filteredTasks.filter(task => task.category === 'hobby');

    renderTasksToColumn(workTasks, workTasksList, 'work');
    renderTasksToColumn(homeTasks, homeTasksList, 'home');
    renderTasksToColumn(hobbyTasks, hobbyTasksList, 'hobby');
    
    addColumnDragHandlers();
}

function renderTasksToColumn(tasksArray, columnElement, category) {
    if (tasksArray.length === 0) {
        columnElement.classList.add('empty');
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-placeholder';
        placeholder.textContent = 'Перетащите задачу сюда';
        placeholder.dataset.category = category;
        columnElement.appendChild(placeholder);
    } else {
        columnElement.classList.remove('empty');
        tasksArray.forEach(task => {
            const li = createTaskElement(task);
            columnElement.appendChild(li);
        });
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.draggable = true;
    li.dataset.id = task.id;
    li.dataset.category = task.category;
    
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
    
    return li;
}

function addColumnDragHandlers() {
    const columns = [
        { element: workColumn, category: 'work' },
        { element: homeColumn, category: 'home' },
        { element: hobbyColumn, category: 'hobby' }
    ];
    
    columns.forEach(col => {
        col.element.ondragover = null;
        col.element.ondrop = null;
        
        col.element.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        col.element.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedTask) {
                moveTaskToCategory(draggedTask.id, col.category);
            }
        });
    });
}

function handleDragStart(e) {
    draggedTask = {
        element: this,
        id: parseInt(this.dataset.id)
    };
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
    
    if (draggedTask) {
        let targetCategory;
        
        if (this.classList.contains('task-item')) {
            targetCategory = this.dataset.category;
        }
        else if (this.classList.contains('empty-placeholder')) {
            targetCategory = this.dataset.category;
        }
        
        if (targetCategory) {
            moveTaskToCategory(draggedTask.id, targetCategory);
        }
    }
    return false;
}

function handleDragEnd() {
    if (draggedTask) {
        draggedTask.element.style.opacity = '1';
    }
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
        filterTasks(this.dataset.filter);
    });
});

tasks = [];
loadTasks();
renderTasks();