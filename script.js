// DOM Elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');

// API Base URL - Update this if your server runs on a different port
const API_BASE_URL = 'http://localhost:3000/tasks';

// Initialize the app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  
  // Add task on Enter key
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// Error handling
function handleError(error) {
  console.error('Error:', error);
  alert('An error occurred. Please try again.');
}

// Show loading state
function showLoading() {
  taskList.innerHTML = '<div class="loading">Loading tasks...</div>';
}

// Update task statistics
function updateStats(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  
  totalTasksEl.textContent = `${totalTasks} tasks`;
  completedTasksEl.textContent = `${completedTasks} completed`;
  remainingTasksEl.textContent = `${remainingTasks} remaining`;
  
  // Show/hide empty state
  emptyState.style.display = totalTasks === 0 ? 'block' : 'none';
}

// Render tasks to the DOM
function renderTasks(tasks) {
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  tasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.id = task.id;
    taskItem.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button class="complete-btn">
          <i class="fas fa-check"></i>
        </button>
        <button class="delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    taskList.appendChild(taskItem);
  });
  
  // Add event listeners after rendering
  addTaskEventListeners();
  updateStats(tasks);
}

// Add event listeners to tasks
function addTaskEventListeners() {
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const taskId = this.closest('.task-item').dataset.id;
      toggleComplete(taskId);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const taskId = this.closest('.task-item').dataset.id;
      deleteTask(taskId);
    });
  });
}

// Load tasks from server
async function loadTasks() {
  try {
    showLoading();
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) throw new Error('Failed to load tasks');
    
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    handleError(error);
    emptyState.style.display = 'block';
  }
}

// Add new task
async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, completed: false }),
    });
    
    if (!response.ok) throw new Error('Failed to add task');
    
    taskInput.value = '';
    await loadTasks();
  } catch (error) {
    handleError(error);
  }
}

// Toggle task completion
async function toggleComplete(id) {
  try {
    // First get the current task to check its status
    const getResponse = await fetch(`${API_BASE_URL}/${id}`);
    if (!getResponse.ok) throw new Error('Failed to get task');
    
    const task = await getResponse.json();
    
    // Then update with the opposite status
    const updateResponse = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !task.completed }),
    });
    
    if (!updateResponse.ok) throw new Error('Failed to update task');
    
    await loadTasks();
  } catch (error) {
    handleError(error);
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete task');
    
    await loadTasks();
  } catch (error) {
    handleError(error);
  }
}