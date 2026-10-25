# SkillBridge Desktop

SkillBridge is an Electron desktop client with a React/Vite frontend and an Express API backed by Prisma 7 and PostgreSQL.

## Development

Install dependencies and start the web app, API, and Electron window:

```sh
npm install
npm run dev
```

The development launcher reuses healthy Vite/API processes on ports `5173` and `4000`.

## Build installers

Build the frontend and bundle the API, then create a desktop package for the current platform:

```sh
npm run build:desktop
```

Platform-specific targets are available with `npm run dist:mac`, `npm run dist:win`, and `npm run dist:linux`. Installers are written to `release/`. Build each platform on its supported host for the most reliable signing and packaging results.

The installer contains the Vite renderer, Electron main/preload files, and a bundled API server. Electron starts that API as a child process when the packaged app opens and stops it when the app exits.

## Configure the database

The packaged app reads its API environment from `.env` in Electron's user-data directory. A non-secret `.env.example` is included beside the packaged resources as a template. Copy it to the user-data directory, set `DATABASE_URL` to a reachable PostgreSQL database, and set a private random `JWT_SECRET` before signing in. The app does not bundle PostgreSQL or database credentials.

In development, the API loads the repository-root `.env` file.