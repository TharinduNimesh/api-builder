# API Builder — Frontend

This repository contains the frontend for API Builder, a visual API designer that makes it easy to create REST endpoints on top of a PostgreSQL database without writing server code. The UI lets users design tables, endpoints, functions, roles, and access rules — then generates the backend configuration automatically.

## What this app does

- Provides a visual interface for designing CRUD endpoints and custom API routes based on your Postgres schema.
- Lets non-developers and developers alike create and manage APIs through a GUI instead of editing code directly.
- Integrates with the backend service (Node + TypeScript + Prisma) which applies changes to the database and exposes the generated endpoints.

## Key features

- Visual endpoint and function editor
- Role-based access and project settings
- SQL / function testing tools in the UI
- Instant preview of generated endpoints through the backend

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local development (frontend)

1. Install Node.js (LTS recommended) and npm.
2. From this folder, install dependencies and start the dev server:

```cmd
cd frontend
npm install
npm run dev
```

By default Vite serves the frontend (see `FRONTEND_PORT` in the project `.env`). The frontend expects the backend API to be available — use the repository root `docker-compose.yml` to start the full stack or run the backend locally.

## Running the full stack with Docker

This project includes a `docker-compose.yml` at the repository root that brings up Postgres, the backend, and the frontend (and nginx). To run the full stack:

```cmd
cd ..
docker-compose up --build
```

Environment variables are defined in the repository root `.env` file. Adjust ports and credentials there as needed.

## Contributing

- Open an issue or submit a pull request for changes.
- Keep UI changes focused and add a short description of the user-facing behavior.

## More information

See the backend folder for server implementation details and the `prisma/schema.prisma` file for the Postgres schema and Prisma models.

If you'd like, I can also add a top-level `README.md` describing how frontend and backend interact, or a `.env.example` highlighting required variables.
