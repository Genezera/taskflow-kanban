# TaskFlow Kanban

Kanban board to organize tasks with drag-and-drop, editing, and LocalStorage persistence. Built as a portfolio project (UI, state, UX, basic accessibility).

## Live demo

- GitHub Pages: `https://genezera.github.io/taskflow-kanban/`

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

## Project structure

- `index.html` – layout
- `styles.css` – styling
- `app.js` – state, rendering, drag-and-drop, storage

## What this project demonstrates

- DOM manipulation and list rendering
- State modeling + persistence
- Drag-and-drop interactions

## Interview talking points

- Why LocalStorage + JSON export and how state is modeled
- UX choices: empty states, feedback toasts, edit flow
- Drag-and-drop limitations and what you would add next (keyboard DnD, aria patterns)

## License

MIT
