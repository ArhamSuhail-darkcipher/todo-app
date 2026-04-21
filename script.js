// =========================
// 1. ELEMENT SELECTION
// =========================
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed-btn");
const taskDate = document.getElementById("task-date");

// =========================
// 2. APP STATE
// =========================
let tasks = [];
let currentFilter = "all";



// =========================
// 3. LOCAL STORAGE HELPERS
// Save tasks to browser storage
// Load tasks from browser storage
// =========================
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// =========================
// 3. ADD TASK
// =========================
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        dueDate: taskDate.value
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = "";
    taskDate.value = "";

    renderTasks();
});

// =========================
// 4. TOGGLE TASK COMPLETE
// =========================
function toggleTask(taskId) {
    tasks = tasks.map(task =>
        task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
    );
    saveTasks();
    renderTasks();
}

// =========================
// 5. DELETE TASK
// =========================
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

// =========================
// 6. EDIT TASK
// Update the text of an existing task
// =========================
function editTask(taskId) {
    const taskToEdit = tasks.find(task => task.id === taskId);

    if (!taskToEdit) return;

    const updatedText = prompt("Edit your task:", taskToEdit.text);

    // Stop if user cancels prompt
    if (updatedText === null) return;

    const trimmedText = updatedText.trim();

    // Stop if new text is empty
    if (trimmedText === "") return;

    tasks = tasks.map(task =>
        task.id === taskId
            ? { ...task, text: trimmedText }
            : task
    );

    saveTasks();
    renderTasks();
}


// =========================
// 6. CLEAR COMPLETED TASKS
// Remove all tasks that are completed
// =========================
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// =========================
// 7. RENDER TASKS
// Show tasks on the page
// =========================
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Show empty state if no tasks match current filter
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.classList.add("empty-state");

        if (tasks.length === 0) {
            emptyMessage.textContent = "No tasks yet. Add one to get started.";
        } else if (currentFilter === "active") {
            emptyMessage.textContent = "No active tasks.";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent = "No completed tasks yet.";
        } else {
            emptyMessage.textContent = "No tasks found.";
        }

        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task-item");

        if (task.completed) {
            li.classList.add("completed");
        }

        const textSpan = document.createElement("span");
        textSpan.classList.add("task-text");
        textSpan.textContent = task.text;

        const taskInfo = document.createElement("div");
        taskInfo.classList.add("task-info");

        taskInfo.appendChild(textSpan);

        if (task.dueDate) {
            const dueDateText = document.createElement("small");
            dueDateText.classList.add("task-date");
            dueDateText.textContent = `Due: ${task.dueDate}`;
            taskInfo.appendChild(dueDateText);
        }

        const actions = document.createElement("div");
        actions.classList.add("task-actions");

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Undo" : "Complete";
        completeBtn.classList.add("task-btn", "complete-btn");
        completeBtn.addEventListener("click", () => {
            toggleTask(task.id);
        });

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("task-btn", "edit-btn");
        editBtn.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("task-btn", "delete-btn");
        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(completeBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(taskInfo);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    const completedCount = tasks.filter(task => task.completed).length;
    const activeCount = tasks.length - completedCount;

    taskCount.textContent = `${activeCount} active • ${completedCount} completed`;

    // Disable clear button if no completed tasks exist
    clearCompletedButton.disabled = completedCount === 0;
}

// =========================
// 8. FILTER BUTTON LOGIC
// =========================
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Update filter state
        currentFilter = button.dataset.filter;

        // Re-render tasks with new filter
        renderTasks();
    });
});


// =========================
// 9. CLEAR COMPLETED BUTTON
// =========================
clearCompletedButton.addEventListener("click", function () {
    clearCompletedTasks();
});

// =========================
// 10. INITIALIZE APP
// Load saved tasks when page opens
// =========================
loadTasks();
renderTasks();