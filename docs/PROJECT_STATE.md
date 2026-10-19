# PROJECT STATE: Ayat Furniture Catalogue (MERN)

## Current phase
Phase 1 complete. Waiting to start Phase 2.

## Completed phases
- Phase 1: Project setup (client + server running)

## Stack
Client: React + Vite 8 (JS), Tailwind v4 (@tailwindcss/vite), ESLint
Server: Node v24, Express (ES modules), helmet, cors, dotenv

## Files created
- client/ (Vite scaffold), client/vite.config.js, client/src/index.css (brand colour tokens), client/src/App.jsx (test page)
- server/package.json, server/.env, server/.env.example, server/src/app.js, server/src/server.js
- server/src/{config,models,controllers,routes,middleware,validators,services,utils,scripts} (empty folders)
- .gitignore, docs/PROJECT_STATE.md

## Commands run
- Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned (PowerShell fix for npm)
- npm create vite@latest client -- --template react
- npm install tailwindcss @tailwindcss/vite (client)
- npm install express cors helmet dotenv (server)

## How to run
- Server: cd server, npm run dev (http://localhost:5000/api/health)
- Client: cd client, npm run dev (http://localhost:5173)

## Config still required
- MongoDB, Cloudinary, SMTP, JWT secret, WhatsApp number (later phases)

## Known issues
- None

## Next task
Phase 2: frontend design foundation (router, site config, shared components, homepage with mock data)