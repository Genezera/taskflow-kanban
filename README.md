# TaskFlow Kanban

Quadro Kanban para organizar tarefas com drag-and-drop, edição e persistência em LocalStorage. Feito para ser um projeto de portfólio (UI, estado, UX, acessibilidade básica).

## Features

- Drag-and-drop entre colunas (Backlog / Em progresso / Concluído)
- Criar, editar e excluir tarefas
- Persistência automática no LocalStorage
- Exportar o estado do board como JSON (copia para a área de transferência)
- Layout responsivo (desktop e mobile)

## Tecnologias

- HTML + CSS
- JavaScript (sem bibliotecas)
- LocalStorage

## Como rodar

- Abra `index.html` no navegador  
  ou
- Rode um servidor local na pasta do projeto:

```bash
python -m http.server 5173
```

Abra: `http://localhost:5173/`

## O que esse projeto demonstra

- Manipulação de DOM e renderização de listas
- Modelagem de estado + persistência
- Interações de drag-and-drop
