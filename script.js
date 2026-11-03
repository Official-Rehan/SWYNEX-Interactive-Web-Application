/* =========================
   STATE
========================= */

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";

let searchText = "";


/* =========================
   ELEMENTS
========================= */

const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskPriority =
    document.getElementById("taskPriority");

const taskDate =
    document.getElementById("taskDate");

const titleError =
    document.getElementById("titleError");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const clearCompleted =
    document.getElementById("clearCompleted");


/* =========================
   STATS ELEMENTS
========================= */

const totalTasks =
    document.getElementById("totalTasks");

const activeTasks =
    document.getElementById("activeTasks");

const completedTasks =
    document.getElementById("completedTasks");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");


/* =========================
   SAVE STATE
========================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


/* =========================
   ADD TASK
========================= */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    const description =
        taskDescription.value.trim();

    const priority =
        taskPriority.value;

    const date =
        taskDate.value;


    /* Form Validation */

    if (title.length < 3) {

        titleError.textContent =
            "Task title must contain at least 3 characters.";

        taskTitle.focus();

        return;

    }


    titleError.textContent = "";


    /* Create new task */

    const newTask = {

        id: Date.now(),

        title: title,

        description: description,

        priority: priority,

        date: date,

        completed: false

    };


    /* Update state */

    tasks.unshift(newTask);


    /* Save */

    saveTasks();


    /* Reset form */

    taskForm.reset();

    taskPriority.value = "medium";


    /* Render */

    renderTasks();

});


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    taskList.innerHTML = "";


    let filteredTasks = tasks.filter(function (task) {

        /* Filter */

        if (
            currentFilter === "active"
            && task.completed
        ) {
            return false;
        }


        if (
            currentFilter === "completed"
            && !task.completed
        ) {
            return false;
        }


        /* Search */

        const search =
            searchText.toLowerCase();

        if (search === "") {
            return true;
        }


        return (
            task.title.toLowerCase().includes(search)
            ||
            task.description.toLowerCase().includes(search)
        );

    });


    /* Empty state */

    if (filteredTasks.length === 0) {

        emptyState.classList.add("show");

    } else {

        emptyState.classList.remove("show");

    }


    /* Create task cards */

    filteredTasks.forEach(function (task) {

        const taskElement =
            document.createElement("div");


        taskElement.className =
            "task-item"
            + (task.completed ? " completed" : "");


        const priorityText =
            task.priority.charAt(0).toUpperCase()
            + task.priority.slice(1);


        let dateText = "";


        if (task.date) {

            const dateObject =
                new Date(task.date + "T00:00:00");

            dateText =
                dateObject.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

        }


        taskElement.innerHTML = `

            <button
                class="task-check ${task.completed ? "completed" : ""}"
                onclick="toggleTask(${task.id})">

                ${task.completed ? "✓" : ""}

            </button>


            <div class="task-content">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${
                    task.description
                    ?
                    `
                    <div class="task-description">
                        ${escapeHTML(task.description)}
                    </div>
                    `
                    :
                    ""
                }


                <div class="task-meta">

                    <span class="priority ${task.priority}">
                        ${priorityText}
                    </span>


                    ${
                        dateText
                        ?
                        `
                        <span class="due-date">
                            Due: ${dateText}
                        </span>
                        `
                        :
                        ""
                    }

                </div>

            </div>


            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})"
                aria-label="Delete task">

                ×

            </button>

        `;


        taskList.appendChild(taskElement);

    });


    updateStats();

}


/* =========================
   TOGGLE TASK
========================= */

function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });


    saveTasks();

    renderTasks();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks = tasks.filter(function (task) {

        return task.id !== id;

    });


    saveTasks();

    renderTasks();

}


/* =========================
   CLEAR COMPLETED
========================= */

clearCompleted.addEventListener(
    "click",
    function () {

        tasks = tasks.filter(function (task) {

            return !task.completed;

        });


        saveTasks();

        renderTasks();

    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    function () {

        searchText =
            this.value.trim();

        renderTasks();

    }
);


/* =========================
   FILTER
========================= */

filterButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(function (btn) {

                btn.classList.remove("active");

            });


            this.classList.add("active");


            currentFilter =
                this.dataset.filter;


            renderTasks();

        }
    );

});


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    const total = tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const active =
        total - completed;


    const percentage =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);


    totalTasks.textContent =
        total;


    activeTasks.textContent =
        active;


    completedTasks.textContent =
        completed;


    progressPercent.textContent =
        percentage + "%";


    progressFill.style.width =
        percentage + "%";


    progressText.textContent =
        `${completed} of ${total} completed`;

}


/* =========================
   SECURITY / HTML ESCAPING
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   INITIAL LOAD
========================= */

renderTasks();