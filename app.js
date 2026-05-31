const STORAGE_KEY = "taskflow-kanban:v1";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeJsonParse(raw, null) : null;
  if (!parsed || !Array.isArray(parsed.tasks)) return { tasks: seedTasks() };
  return { tasks: parsed.tasks };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: state.tasks }));
}

function seedTasks() {
  return [
    {
      id: uid(),
      title: "Build the board layout",
      description: "Set up columns and the drag-and-drop flow.",
      status: "backlog",
      priority: "medium",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      title: "Persist to LocalStorage",
      description: "Save and restore tasks automatically.",
      status: "doing",
      priority: "high",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      title: "Add polish",
      description: "Improve accessibility and micro-interactions.",
      status: "done",
      priority: "low",
      createdAt: Date.now(),
    },
  ];
}

function byCreatedAtDesc(a, b) {
  return (b.createdAt || 0) - (a.createdAt || 0);
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const dialog = $("[data-dialog]");
const form = $("[data-form]");
const addBtn = $("[data-add-task]");
const saveBtn = $("[data-save]");
const deleteBtn = $("[data-delete]");
const resetBtn = $("[data-reset]");
const exportBtn = $("[data-export]");
const toastEl = $("[data-toast]");
const formTitleEl = $("[data-form-title]");

const dropzones = new Map(
  $$("[data-dropzone]").map((el) => [el.dataset.dropzone, el]),
);

let state = loadState();
let draggingId = null;
let toastTimer = null;

function openDialog(mode, task) {
  if (!dialog) return;
  form.reset();
  form.elements.id.value = "";
  deleteBtn.hidden = true;

  if (mode === "edit" && task) {
    formTitleEl.textContent = "Edit task";
    form.elements.id.value = task.id;
    form.elements.title.value = task.title || "";
    form.elements.description.value = task.description || "";
    form.elements.status.value = task.status || "backlog";
    form.elements.priority.value = task.priority || "medium";
    deleteBtn.hidden = false;
  } else {
    formTitleEl.textContent = "New task";
    form.elements.status.value = "backlog";
    form.elements.priority.value = "medium";
  }

  dialog.showModal();
  form.elements.title.focus();
}

function closeDialog() {
  if (!dialog?.open) return;
  dialog.close();
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function priorityLabel(priority) {
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Medium";
}

function createTaskCard(task) {
  const el = document.createElement("article");
  el.className = "card";
  el.draggable = true;
  el.dataset.taskId = task.id;
  el.setAttribute("role", "listitem");
  el.setAttribute("aria-grabbed", "false");

  const top = document.createElement("div");
  top.className = "card__top";

  const title = document.createElement("h3");
  title.className = "card__title";
  title.textContent = task.title || "Untitled";

  const edit = document.createElement("button");
  edit.className = "icon-btn";
  edit.type = "button";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => openDialog("edit", task));

  top.appendChild(title);
  top.appendChild(edit);

  const desc = document.createElement("p");
  desc.className = "card__desc";
  desc.textContent = task.description || "";

  const meta = document.createElement("div");
  meta.className = "meta";

  const pr = document.createElement("span");
  pr.className = `pill pill--${task.priority || "medium"}`;
  pr.textContent = `Priority: ${priorityLabel(task.priority)}`;

  const st = document.createElement("span");
  st.className = "pill";
  st.textContent =
    task.status === "doing"
      ? "In progress"
      : task.status === "done"
        ? "Done"
        : "Backlog";

  meta.appendChild(pr);
  meta.appendChild(st);

  el.appendChild(top);
  if (task.description) el.appendChild(desc);
  el.appendChild(meta);

  el.addEventListener("dragstart", (ev) => {
    draggingId = task.id;
    el.setAttribute("aria-grabbed", "true");
    try {
      ev.dataTransfer.setData("text/plain", task.id);
      ev.dataTransfer.effectAllowed = "move";
    } catch {}
  });

  el.addEventListener("dragend", () => {
    draggingId = null;
    el.setAttribute("aria-grabbed", "false");
    dropzones.forEach((dz) => dz.classList.remove("is-over"));
  });

  return el;
}

function render() {
  const groups = {
    backlog: [],
    doing: [],
    done: [],
  };

  for (const task of state.tasks) {
    if (!groups[task.status]) groups.backlog.push(task);
    else groups[task.status].push(task);
  }

  for (const status of Object.keys(groups)) {
    const dz = dropzones.get(status);
    if (!dz) continue;
    dz.replaceChildren();
    const tasks = groups[status].slice().sort(byCreatedAtDesc);
    for (const t of tasks) dz.appendChild(createTaskCard(t));
    const countEl = $(`[data-count="${status}"]`);
    if (countEl) countEl.textContent = String(tasks.length);
  }
}

function upsertTask(task) {
  const idx = state.tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) state.tasks[idx] = task;
  else state.tasks.unshift(task);
  saveState(state);
  render();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((t) => t.id !== taskId);
  saveState(state);
  render();
}

function moveTask(taskId, status) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.status = status;
  saveState(state);
  render();
}

addBtn?.addEventListener("click", () => openDialog("new"));

saveBtn?.addEventListener("click", () => {
  const title = form.elements.title.value.trim();
  const description = form.elements.description.value.trim();
  const status = form.elements.status.value;
  const priority = form.elements.priority.value;
  const id = form.elements.id.value || uid();

  if (!title) {
    form.elements.title.focus();
    return;
  }

  const existing = state.tasks.find((t) => t.id === id);
  const task = {
    id,
    title,
    description,
    status,
    priority,
    createdAt: existing?.createdAt ?? Date.now(),
  };

  upsertTask(task);
  closeDialog();
  showToast(existing ? "Task updated." : "Task created.");
});

deleteBtn?.addEventListener("click", () => {
  const id = form.elements.id.value;
  if (!id) return;
  deleteTask(id);
  closeDialog();
  showToast("Task deleted.");
});

resetBtn?.addEventListener("click", () => {
  const ok = confirm("Are you sure you want to clear the board?");
  if (!ok) return;
  state = { tasks: [] };
  saveState(state);
  render();
  showToast("Board cleared.");
});

exportBtn?.addEventListener("click", async () => {
  const payload = JSON.stringify({ tasks: state.tasks }, null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    showToast("JSON copied to clipboard.");
  } catch {
    showToast("Couldn't copy. Check the JSON in the console.");
    console.log(payload);
  }
});

for (const [status, dz] of dropzones.entries()) {
  dz.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    dz.classList.add("is-over");
    ev.dataTransfer.dropEffect = "move";
  });

  dz.addEventListener("dragleave", () => dz.classList.remove("is-over"));

  dz.addEventListener("drop", (ev) => {
    ev.preventDefault();
    dz.classList.remove("is-over");
    let id = null;
    try {
      id = ev.dataTransfer.getData("text/plain");
    } catch {}
    id = id || draggingId;
    if (!id) return;
    moveTask(id, status);
    showToast("Task moved.");
  });
}

document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  closeDialog();
});

render();
