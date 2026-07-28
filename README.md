# VehicleRental

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.4.

## Getting started (first-time setup)

**Prerequisites:** Node.js **v24.15+** (or v22.22.3+ / v26+) and npm.

The repo is a full-stack app: an Angular frontend (root) and an Express/MongoDB
backend (`backend/`). You need to set up and run **both**.

```bash
# 1. Install dependencies (run in BOTH folders)
npm install
cd backend && npm install && cd ..

# 2. Create the backend env file (it is gitignored, so it is NOT in the repo)
cd backend
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

Then open `backend/.env` and fill in the values. Most already work as-is, but:

- **`PORT` must stay `5001`** — the frontend calls `http://localhost:5001/api`.
- **`JWT_SECRET`** — set any non-empty string (login breaks if it's empty).
- **ABA PayWay** (`PAYWAY_MERCHANT_ID`, `PAYWAY_API_KEY`) — required only for the
  payment feature. Ask a teammate for the current **sandbox** credentials; they
  are intentionally kept out of git.

```bash
# 3. Run the backend (terminal 1)
cd backend && npm run dev        # -> http://localhost:5001

# 4. Run the frontend (terminal 2, from the repo root)
npm start                        # -> http://localhost:4200
```

MongoDB connects to a shared Atlas cluster automatically (a fallback is baked
into `backend/src/config/db.js`), so no local database is needed.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
