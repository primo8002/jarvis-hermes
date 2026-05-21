# Jarvis Claude Voice Assistant

This project is a local-first voice assistant cockpit. The browser UI streams prompts to a Node server, which invokes Claude Code CLI to perform tasks on this computer.

## Commands
- npm run dev: start Vite client and Node server in development
- npm run build: production build
- npm start: run production server

## Permission Model
- By default this project is configured for Svanik's requested full-computer assistant mode using Claude CLI bypass permissions.
- It binds to localhost only.
- Change JARVIS_PERMISSION_MODE=default to make Claude ask for permissions.
