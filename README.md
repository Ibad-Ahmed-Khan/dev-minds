# Project Billing System – Full Stack Assessment Summary

This project demonstrates my full-stack development capabilities with structured backend APIs, secure authentication, drag-and-drop features, and responsive UI.

---

## How to Run the Project

### Backend

Open terminal and navigate to the backend:
cd backend
Start server: use this command to run server "npm run dev"

### Frontend

Open another terminal and navigate to frontend:
cd project-billing-system
Start app: use this command to run server "npm run dev"

Once both servers are running, the application will be available on localhost.

---

## Authentication / Protected Routes

Users can sign up and log in.

After login, users are redirected to `/dashboard`.

Protected pages include:

- Dashboard
- Projects
- Time Logs

---

## Frontend Details (Fully Responsive)

**Tech Stack:** Next.js (TypeScript), Tailwind CSS, Axios

- Fetching data through APIs (Projects & Time Logs)
- Drag & Drop implementation using `dnd-kit`
- Responsive UI using flex/grid layouts, media queries, CSS clamp, and keyframe animations
- Layout components with conditional rendering for hiding header/footer on login/signup
- Zustand for global state + Local Storage for persistence
- React Icons for clean UI
- ES6 features used throughout (mapping, filtering, arrow functions)

---

## Backend Details

**Tech Stack:** Node.js + Express

- JWT authentication + bcrypt secure password hashing
- Environment handling with dotenv
- CRUD APIs for projects and time logs
- Clean routing and structured organization
- Nodemon for smoother development

---

## Highlights of Skill Demonstration

- Secure authentication and token management
- Full REST API integration with frontend
- Responsively designed UI following modern principles
- Solid ES6 and TypeScript concepts
- Modular code with scalability mindset
- Demonstrated knowledge of state management, drag & drop, routing, and layout structure

---

## Closing Note

The goal of this assessment was to demonstrate software development ability, not UI polish.  
Given more time, I can deliver advanced loaders, improved UI themes, reusable modules, and additional refinement.
