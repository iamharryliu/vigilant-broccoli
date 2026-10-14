# Todo App

A simple, functional todo application built with React, Vite and TypeScript. Features include:
- Add new todos
- Mark todos as complete/incomplete
- Delete individual todos
- Filter todos (all/active/completed)
- Clear completed todos
- Persistence using localStorage
- Responsive design
- Dark mode support

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm serve

# Build for production
pnpm build
```

## Features

- **Add Todos**: Type in the input field and press Enter or click "Add"
- **Toggle Completion**: Click on a todo item to mark it as complete/incomplete
- **Delete Todos**: Click the delete button next to each todo
- **Filter Todos**: Switch between All, Active, and Completed views
- **Clear Completed**: Remove all completed todos at once
- **Persistence**: Todos are saved to localStorage and persist between sessions
- **Responsive Design**: Works on mobile and desktop devices
- **Dark Mode**: Automatically follows system preference

## Deployment

This app is deployed to Cloudflare Pages. The deployment targets are:
- `deploy` - for staging (main branch)
- `deploy:production` - for production (production branch)
- `deploy:preview` - for pull request previews
