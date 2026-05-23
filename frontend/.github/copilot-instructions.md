# Copilot Workspace Instructions

## Project Context
- **Name:** Dronehub Web-GCS
- **Description:** Frontend UI/UX shell for DroneEngage telemetry/video streams.
- **Goal:** Provide a robust, modular, and reusable Ground Control Station interface.

## Tech Stack
- React 19, Vite, JS ES6+, JSX
- React Router DOM, Framer Motion, Mapbox GL
- CSS Flexbox (standard CSS/module approach)
- Deployment: Docker multi-stage build + Nginx -> AWS Linux

## Architecture Guidelines
- **Feature-Driven Structure:** Code is organized by domain features (`auth`, `dashboard`, `fleet`, `mission`, etc.) inside `src/features/`.
- **API & Configuration:** NEVER hardcode API endpoints. Always use environment variables (`VITE_API_BASE_URL` for local, runtime `API_BASE_URL` inside Docker).
- **Client Networking:** Use the shared Axios client in `src/utils/apiClient.js` for all network requests.

## Coding Conventions
- **Comments:** All code comments MUST be written in **English**. Keep them explicit and beginner-friendly (avoid terse wording).
- **Modularity:** Keep components small, modular, and reusable. Follow modern React design patterns (hooks, functional components).
- **Async Operations:** Prefer `async/await` syntax for asynchronous operations.
- **Styling:** Develop Figma screen batches incrementally (static first, then dynamic) starting with HTML/JSX skeletons and Flexbox CSS.

## Deployment Readiness
- Ensure code works seamlessly across Local -> Docker Build -> Registry -> AWS EC2 without any code rewrites. Use standard Vite environment variable patterns.

## Agent Behavior
- **Language:** Chat responses with the user MUST be in **Vietnamese**. Code integration and comments must be in **English**.
- **Execution:** Follow the feature roadmap step by step. Validate UI logic and structure before diving into complex dynamic data binding unless specified otherwise.
