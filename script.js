const taskInput = document.getElementById("task-input");
const tagSelect = document.getElementById("tag-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const progressFill = document.getElementById("progress-fill");
const progressCircle = document.getElementById("progress-circle");

let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
let draggedIndex = null;

function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function updateProgress() {
  const allTasks = document.querySelectorAll('.task-item');
  const completed = document.querySelectorAll('.task-item input[type="checkbox"]:checked');
  const progress = allTasks.length ? (completed.length / allTasks.length) * 100 : 0;

  progressFill.style.width = `${progress}%`;
  progressCircle.textContent = `${completed.length}/${allTasks.length}`;

  if (allTasks.length > 0 && completed.length === allTasks.length) {
    triggerConfetti();
  }
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("draggable", false);
    li.dataset.index = index;

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "☰";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    };

    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = "task-text" + (task.completed ? " completed" : "");

    const tagContainer = document.createElement("div");
    tagContainer.className = "tag-container";
    if (task.tags?.length) {
      task.tags.forEach(tag => {
        const tagElem = document.createElement("span");
        tagElem.className = "tag";
        tagElem.textContent = `#${tag}`;
        tagContainer.appendChild(tagElem);
      });
    }

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✎";
    editBtn.className = "edit";
    editBtn.onclick = () => {
      const newText = prompt("Edit task:", task.text);
      if (newText) {
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    actions.append(editBtn, deleteBtn);
    li.append(dragHandle, checkbox, span, tagContainer, actions);
    taskList.appendChild(li);
  });

  addDragAndDropListeners();
  updateProgress();
}

function addDragAndDropListeners() {
  const items = document.querySelectorAll(".task-item");

  items.forEach(item => {
    const handle = item.querySelector(".drag-handle");

    handle.addEventListener("mousedown", (e) => {
      item.setAttribute("draggable", true);
      item.classList.add("lifted");
    });

    handle.addEventListener("mouseup", () => {
      item.setAttribute("draggable", false);
      item.classList.remove("lifted");
    });

    item.addEventListener("dragstart", (e) => {
      item.classList.add("dragging");
      draggedIndex = +item.dataset.index;
      e.dataTransfer.effectAllowed = "move";
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging", "lifted");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggingItem = document.querySelector(".dragging");
      const current = item;
      if (current && current !== draggingItem) {
        const rect = current.getBoundingClientRect();
        const next = (e.clientY - rect.top) > (rect.height / 2);
        current.parentNode.insertBefore(draggingItem, next ? current.nextSibling : current);
      }
    });

    item.addEventListener("drop", () => {
      const reorderedItems = [...document.querySelectorAll(".task-item")];
      tasks = reorderedItems.map(el => tasks[+el.dataset.index]);
      saveTasks();
      renderTasks();
    });
  });
}

addTaskBtn.onclick = () => {
  const text = taskInput.value.trim();
  const selectedTag = tagSelect.value.trim();
  const tags = selectedTag ? [selectedTag] : [];

  if (text !== "") {
    tasks.push({ text, completed: false, tags });
    taskInput.value = "";
    tagSelect.selectedIndex = 0;
    saveTasks();
    renderTasks();
  }
};

function triggerConfetti() {
  const count = 200, defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    }));
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

renderTasks();
