# STARWEST 2026 - Advanced Project Questions

Answers about BuggyBoard, the Advanced tutorial project at `C:/Git projects/playwright advanced/`. Stack details below were checked against the local project on 2026-09-22.

## 1. What is the project's tech stack?

BuggyBoard is a full-stack Node.js application with a React frontend styled using Tailwind CSS. The frontend and backend are separate npm workspaces in one repository, and both are written in TypeScript.

| Area | Technology | Role |
|---|---|---|
| Frontend | React 18, React Router 7 | UI components and client-side routes (`/login` and `/board`) |
| Frontend tooling | Vite 8 | Development server and frontend build |
| Styling | Tailwind CSS 3 (`^3.4.15` declared), PostCSS, Autoprefixer | Utility classes and CSS processing |
| Backend | Node.js, Express 4 | JSON API under `/api` |
| Database | SQLite through `better-sqlite3` 13 | Persistent bug records in `backend/data/buggyboard.db` |
| Languages | TypeScript/TSX, HTML, CSS, SQL | Application code, pages, styling, and database queries |
| Browser testing | Playwright Test | Configured for Chromium, Firefox, and WebKit |
| Development tools | npm workspaces, `concurrently`, `tsx`, TypeScript compiler, ESLint, Prettier | Run both services, watch backend code, build, lint, and format |

The package manifests declare TypeScript `~5.6.2`. `npm run dev` at the repo root starts both services: Vite serves the frontend at `http://localhost:5173`, and Express listens on port 3000. Vite proxies `/api` requests to Express. The frontend uses `localStorage` to retain the signed-in username; the demo accounts are defined in `users.json` at the repo root.

The Playwright installation is present, but `tests/example.spec.ts` still contains the generated tests against `playwright.dev`, not BuggyBoard tests. The Playwright config has no active `baseURL` or `webServer` setting, and the root package has no `npm test` script yet.

**Project sources:** `package.json`, `frontend/package.json`, `backend/package.json`, `frontend/vite.config.ts`, `playwright.config.ts`, `specs/engineering/tech-stack.md`.

## 2. How are user credentials configured?

The demo accounts are configured as username/password pairs in `users.json` at the Advanced project root, separate from the SQLite bug database. The file currently contains:

| Username | Password |
|---|---|
| `buggy` | `1970beetle` |
| `vanny` | `1979bus` |

When someone submits the login form, the frontend sends the credentials to `POST /api/login`. The backend reads `users.json`, trims leading and trailing whitespace from the username, and compares the username and password with an account in the file. The password must match exactly. A valid login returns the username; invalid credentials return an error.

After a successful login, the frontend stores only the username under `buggyboard_user` in browser `localStorage` so the UI stays signed in after a refresh. There is no server-side session or token, and the bug API routes do not check authentication. Passwords in `users.json` are plain text because this is an educational sample app, not a production authentication system.

**Project sources:** `users.json`, `backend/src/users.ts`, `backend/src/authService.ts`, `backend/src/index.ts`, `frontend/src/LoginPage.tsx`, `frontend/src/auth.tsx`, `specs/features/02-user-accounts.md`.

## 3. What are the app's main behaviors?

BuggyBoard is a small bug tracker with these main user flows:

1. **Sign in and out.** A user enters an account from `users.json` on `/login`. The app shows an error for blank or incorrect credentials, opens `/board` after a valid login, and keeps the UI signed in across page refreshes. Logout clears the browser's stored username and returns to the login page.
2. **View the bug board.** The board lists bugs from SQLite with ID, severity, title, and owner. Severity is color-coded. It initially shows Open bugs; the user can switch to Closed. It shows an empty or no-match message when appropriate.
3. **Create a bug.** The New Bug button opens a form for title, severity, owner, and description. Owner defaults to the signed-in username. Required fields are validated; saving assigns an ID, sets the state to Open, stores the bug, and refreshes the board. Cancel or close discards the entry.
4. **View and edit a bug.** Clicking a board row opens its details. The ID is read-only; the user can change title, severity, owner, description, or Open/Closed state. Save is disabled when nothing changed or a required field is blank. Saving updates SQLite and refreshes the board; cancel or close leaves the bug unchanged.
5. **Delete a bug.** Delete is available from the edit dialog and asks for confirmation. Confirming removes the bug from SQLite and the board; canceling leaves it intact.
6. **Find and organize bugs.** The board searches titles as the user types, with case-insensitive matching. The user can clear the search and sort by ID, severity, title, or owner. The initial sort is severity from High to Low. Search, sort, and the Open/Closed filter work together.

**Implementation note:** The search spec says `login` should match `log-in`, but the current normalization turns `log-in` into `log in`, so the code appears to miss that example. This was found by reading the source, not by running the app.

**Project sources:** `specs/PROGRESS.md`, `specs/features/03-login.md`, `specs/features/06-create-bug.md` through `specs/features/13-bug-status.md`, `frontend/src/App.tsx`, `frontend/src/BoardPage.tsx`, `frontend/src/CreateBugModal.tsx`, `frontend/src/EditBugModal.tsx`, `frontend/src/TitleBar.tsx`, `backend/src/index.ts`, `backend/src/bugService.ts`.

## 4. How do I perform the main user workflow?

The main workflow is to log in, create a bug, review it on the board, update or close it, and log out.

1. In a terminal at `C:/Git projects/playwright advanced/`, run `npm run dev`. Open `http://localhost:5173/`. The Basics app should be stopped because its app and the Advanced backend both use port 3000.
2. On the login page, enter `buggy` / `1970beetle` (or `vanny` / `1979bus`) and select **Login**. The app opens the bug board.
3. Select **New Bug**. Enter a title and description, choose a severity (HIGH, MID, or LOW), and check the owner, which defaults to the signed-in username. Select **Save**. The new bug is stored with an assigned ID and Open state and appears in the Open view.
4. Find the bug in the table. Use **Search bugs** to filter by title if needed, or select a column heading to sort. Select the bug's row to open **Edit bug #...**.
5. Change a field and select **Save** to update it. To close the bug, choose **Closed** in the edit dialog's **State** field and save. The bug leaves the default Open view; select **Closed** above the table to see it again.
6. If the bug should be removed instead, open its row, select **Delete**, and confirm in the **Delete bug** dialog. Deletion is permanent in the app.
7. Select **Logout** in the title bar when finished.

**Project sources:** `projects/starwest-2026/overview.md` in the KB; `frontend/src/LoginPage.tsx`, `frontend/src/TitleBar.tsx`, `frontend/src/BoardPage.tsx`, `frontend/src/CreateBugModal.tsx`, `frontend/src/EditBugModal.tsx`, `backend/src/bugService.ts`, and `users.json` in the Advanced repo.

## 5. What documentation does the project contain?

The Advanced repo documents both the app and the process used to build and test it. The root `README.md` is the starting point for the app's purpose, quickstart, features, technology, and links into the specs. The `specs/` directory is the project's declared source of truth.

| Location | Contents |
|---|---|
| `specs/constitution.md` | Top-level rules for spec-first work, progress tracking, and review after each feature. |
| `specs/PROGRESS.md` | Checklist showing setup and features 01 through 13 as implemented. |
| `specs/product/` | Product vision, domain glossary, and early design intentions (`braindump.md`). |
| `specs/design/theme.md` | UI theme, color, and modal interaction guidance. |
| `specs/engineering/` | Tech stack, coding standards, development process, API conventions, Gherkin standards, Playwright test patterns, and pipeline design. |
| `specs/features/` | Thirteen numbered feature specs, from favicon and login through bug creation, editing, sorting, searching, deletion, and Open/Closed status. These include user stories and acceptance criteria. |
| `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/read-specs.mdc` | Instructions telling those AI tools to follow the specs and test conventions. |

Each `specs/` subdirectory also has a short `README.md` explaining its purpose. A local, untracked `claude-advanced-answers.md` currently holds another set of course answers; it is a companion report file, not part of the canonical specs. The engineering pipeline document describes the intended CI workflow, not proof that the workflow is active.

**Project sources:** `README.md`, `specs/constitution.md`, `specs/PROGRESS.md`, the `README.md` files under `specs/`, and the documentation paths listed above.

## 6. How do I reset the app's data?

Bug records live in the single SQLite file `backend/data/buggyboard.db`. The app has no reset button or `/api/reset` endpoint. To start with an empty bug database while keeping the old data as a backup:

1. Stop `npm run dev` with Ctrl+C so the backend closes the database.
2. In a PowerShell terminal at `C:/Git projects/playwright advanced/`, rename the database file:

   ```powershell
   Rename-Item -LiteralPath 'backend/data/buggyboard.db' -NewName ('buggyboard.db.bak-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
   ```

3. Run `npm run dev` again. The backend creates a fresh `buggyboard.db` and an empty `bugs` table, so bug IDs start over at 1.

This does not change the demo accounts in `users.json`. It also does not clear the browser's saved login; select **Logout** to remove `buggyboard_user` from `localStorage`. For repeated automated tests, the current app has no dedicated reset API, so tests need their own data setup and cleanup strategy.

**Project sources:** `backend/src/db.ts`, `backend/src/index.ts`, `specs/engineering/tech-stack.md`, `frontend/src/auth.tsx`, `.gitignore`.
