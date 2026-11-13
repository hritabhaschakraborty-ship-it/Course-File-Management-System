# Course File Management System

A web application for managing course files, assessments, attendance, and review workflows.

## Requirements

- Node.js and npm

## Run locally

1. In `Server`, install dependencies and create your local environment file:

   ```sh
   cd Server
   npm install
   cp .env.example .env
   ```

   Set a private value for `JWT_SECRET` in `Server/.env`.

2. Start the backend from the `Server` directory:

   ```sh
   npm run dev
   ```

3. In a second terminal, start the frontend:

   ```sh
   cd Client
   npm install
   npm run dev
   ```

The frontend runs on port 3000 and proxies API requests to the backend on port 5000.

## Team workflow

After being added as a repository collaborator, clone the repository, create a branch for your work, and open a pull request before merging changes to `main`.

## Local data

Environment files, SQLite databases, generated files, dependencies, and uploaded files are excluded from Git. Do not commit real student records, credentials, or course documents unless you have permission to share them.
