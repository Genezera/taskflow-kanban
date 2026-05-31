# TaskFlow Kanban

Kanban board to organize tasks with drag-and-drop, editing, and LocalStorage persistence. Built as a portfolio project (UI, state, UX, basic accessibility).

## Features

- Drag and drop across columns (Backlog / In progress / Done)
- Create, edit, and delete tasks
- Automatic persistence via LocalStorage
- Export board state as JSON (copies to clipboard)
- Responsive layout (desktop and mobile)

## Tech

- HTML + CSS
- JavaScript (no libraries)
- LocalStorage

## Run

- Open `index.html` in your browser  
  or
- Run a local server in the project folder:

```bash
python -m http.server 5173
```

Open: `http://localhost:5173/`

## What this project demonstrates

- DOM manipulation and list rendering
- State modeling + persistence
- Drag-and-drop interactions
