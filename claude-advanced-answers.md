# Claude - Advanced Course Answers

## Q1: What is the tech stack? (frontend, backend, database, languages, etc.)

| Layer | Tech | Version | Notes |
|---|---|---|---|
| Frontend framework | React | 18.3.1 | with `react-dom` 18.3.1 |
| Frontend routing | React Router | 7.0.1 | `react-router-dom` |
| Frontend build tool | Vite | 8.0.9 | dev server + build |
| Styling | Tailwind CSS | 3.4.15 | + `autoprefixer`, `postcss` |
| Backend framework | Express | 4.21.1 | Node HTTP API |
| Backend runtime helper | tsx | 4.19.2 | runs TS directly in dev (`tsx watch`) |
| Database | SQLite | via `better-sqlite3` 13.0.3 | single file at `backend/data/buggyboard.db`, no migrations |
| Language | TypeScript | 5.6.2 | entire codebase, frontend + backend |
| Package layout | npm workspaces | — | `frontend/` and `backend/` as workspaces under one root `package.json` |
| Linting/formatting | ESLint 9 + Prettier 3 | — | `typescript-eslint`, React plugins |
| Testing | Playwright | `@playwright/test` 1.63.0 | course focus; no tests written yet |
| Node | Node.js | 22.16.0 (machine) | via nvm |

Source: `specs/engineering/tech-stack.md`, `package.json`, `frontend/package.json`, `backend/package.json`.

## Q2: How are user credentials configured?

- **Storage:** `users.json` at the repo root — a flat JSON array of `{ username, password }` objects. Not loaded into SQLite; read fresh from disk on every login attempt. Two accounts currently defined: `buggy` / `1970beetle` and `vanny` / `1979bus`.
- **Passwords are plain text — no hashing, no salting.** `backend/src/authService.ts` compares with a direct `user.password !== password` string check. This is intentional for a teaching app (deliberately "buggy"), not a production pattern.
- **Read path:** `backend/src/users.ts` → `getUsers()` reads/parses `users.json`, returns `[]` if the file is missing, and filters to well-formed `{username, password}` string pairs.
- **Auth logic:** `backend/src/authService.ts` → `login(username, password)` trims the username, then validates in order: both blank → `MISSING_CREDENTIALS`; blank username → `BLANK_USERNAME`; blank password → `BLANK_PASSWORD`; no match/wrong password → `INVALID_CREDENTIALS`. Pure business logic, no HTTP — kept in the service layer per `specs/engineering/coding-standards.md`.
- **HTTP layer:** `backend/src/index.ts:37` exposes `POST /api/login`, calling the service function above and mapping its result to the HTTP response.

Source: `users.json`, `backend/src/users.ts`, `backend/src/authService.ts`, `backend/src/index.ts`, `specs/features/02-user-accounts.md`.

### Whitespace trimming

- Server (`authService.ts:19`): only the **username** is trimmed before lookup/comparison. The **password is never trimmed**, client or server — a trailing space would fail to match.
- Client (`auth.tsx:55`): on success, the frontend trims the username again before storing it — redundant with the server trim, harmless.
- `LoginPage.tsx` does no trimming/validation before sending; it POSTs the raw input.

### API interaction

- Frontend: `fetch("/api/login", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ username, password }) })` — relative URL, proxied by Vite (5173) to Express (3000).
- Backend (`index.ts:37-73`) reads `req.body.username`/`password` (default `""`), calls `login()`, and maps the result:
  - `200` → `{ username }`
  - `400` → `{ error: "blank_username" | "blank_password" | "missing_credentials", message }`
  - `401` → `{ error: "invalid_credentials", message: "Invalid username or password." }`
- CORS is hard-coded to allow only `http://localhost:5173` (`index.ts:13-21`).

### What's stored in localStorage

- Key `buggyboard_user`, value `{"username": "..."}` — username only. No password, token, session ID, or expiry.
- `frontend/src/auth.tsx` reads this on load to set `isAuthenticated`; `logout()` just removes the key.
- **No server-issued session token exists at all.** "Logged in" is a pure client-side flag; `/api/bugs` and other endpoints have no auth middleware and never check this value. Setting `localStorage.setItem('buggyboard_user', JSON.stringify({username:'x'}))` manually bypasses login entirely — a likely intentional "bug" for the course.

Source (addendum): `frontend/src/LoginPage.tsx`, `frontend/src/auth.tsx`, `backend/src/index.ts`.

## Q3: What are the main behaviors of the app?

1. **Login / Logout** — username+password form; logout in the title bar clears the session, redirects to login.
2. **Bug board (main view)** — `/board` table with columns ID, Severity, Title, Owner (left to right). Empty state shows an empty table.
3. **Create bug** — "New Bug" button in title bar opens a modal: Title, Severity (dropdown HIGH/MID/LOW), Owner (pre-filled with current user), Description — all required. Save persists + closes; Cancel/X/Escape discard without saving; backdrop click does NOT close (data preserved).
4. **Edit bug** — click a table row → modal titled "Edit bug #<id>", ID read-only, rest editable. Save disabled when no changes, and disabled again if a required field is blanked. Same Cancel/X/Escape/backdrop rules as create.
5. **Delete bug** — "Delete" button inside Edit modal opens a confirmation modal ("Are you sure you want to delete bug #<ID>: <Title>?"). Confirm removes the bug and closes both modals; Cancel returns to Edit modal unchanged.
6. **Severity color-coding** — HIGH = strong terracotta (`#b84a2e`), MID = amber (`#a67c47`), LOW = muted sage (`#4a6b5e`), as CSS custom properties; used on the board table and both severity dropdowns.
7. **Column sorting** — all 4 columns (ID, Severity, Title, Owner) sortable via header click; toggles ascending/descending; only one column sorted at a time; arrow indicator shows direction. Default: Severity descending (HIGH→MID→LOW). Severity ascending = LOW→MID→HIGH.
8. **Search** — title bar text field (left of "New Bug"), filters by title only, live, case-insensitive, collapses whitespace, normalizes punctuation. X clears once text entered. Sort order preserved while searching. No matches → "no bugs matched" message.
9. **Bug status (Open/Closed)** — every bug has state, defaults to Open on creation, changeable only via Edit modal. Toggle above the board (Open/Closed, default Open) filters the table; sort and search still apply on top; no matches → same "no bugs matched" message.

Source: `specs/features/06-create-bug.md` through `13-bug-status.md`, `specs/PROGRESS.md`.

## Q4: How do I perform the main user workflow?

1. **Start the app** (if not running): `npm run dev` at repo root → frontend http://localhost:5173, backend :3000.
2. **Log in** at the root URL: `buggy` / `1970beetle` or `vanny` / `1979bus`. Redirects to `/board`, stores `{username}` in localStorage (`buggyboard_user`).
3. **Board page** — table (ID, Severity, Title, Owner), default sort Severity descending, default filter Open.
4. **Create a bug** — "New Bug" button (title bar) → modal, Owner pre-filled to current user → fill Title/Severity/Description → Save. New bug is state Open.
5. **Find a bug** — sort via column header click (toggles asc/desc), or filter via the search field (left of "New Bug"), live, title-only, case/whitespace/punctuation-insensitive.
6. **Edit a bug** — click its row → "Edit bug #<id>" modal, ID read-only, rest editable including State (Open/Closed). Save disabled until a real, non-blank change exists.
7. **Delete a bug** (optional) — "Delete" inside Edit modal → confirmation modal (names bug by ID/title) → confirm removes it, Cancel backs out unchanged.
8. **Log out** — title bar; clears localStorage, returns to login.

Source: synthesis of `specs/features/*.md` (03, 06-13) and `frontend/src/auth.tsx`.

## Q5: How do I reset data for this app?

**No built-in reset endpoint exists** (unlike Basics, which has `POST /api/reset` via json-server). Nothing in `backend/src/index.ts`, `db.ts`, or `bugService.ts` exposes a reset/delete-all route.

Manual reset procedure:
1. Stop the dev server (`Ctrl+C`) — `better-sqlite3` holds an open file handle while running.
2. Delete `backend/data/buggyboard.db`.
3. Restart (`npm run dev`). `backend/src/db.ts:18` (`initBugsTable()`) runs `CREATE TABLE IF NOT EXISTS bugs (...)` on every startup, recreating an empty table automatically.

This matches the documented approach in `specs/engineering/tech-stack.md`: no migrations; delete the SQLite file for a fresh database.

Notes:
- **User accounts** (`users.json`) are untouched by this — separate from the SQLite file.
- **No live/in-process reset** — unlike Basics, there's no way to clear data without restarting the backend. A test suite needing per-test isolation will likely need to add its own reset endpoint or seed script, not just call an existing one.

Source: `backend/src/db.ts`, `backend/src/index.ts`, `backend/src/bugService.ts`, `specs/engineering/tech-stack.md`.

## Q6: What documentation does this app provide?

**Top-level:**
- `README.md` — overview, quickstart, feature list, tech stack summary, pointer into `specs/`.
- `LICENSE` — MIT.
- `.devcontainer/devcontainer.json` — Codespaces config.

**AI agent instructions** (three near-identical copies): `CLAUDE.md`, `.cursor/rules/read-specs.mdc`, `.github/copilot-instructions.md` — read specs before implementing, spec-first/feature-by-feature, update `PROGRESS.md`, pause for review, POM/fixtures for tests.

**`specs/` (the main documentation body):**
- `constitution.md` — supreme reference: where context lives, canonical workflow (spec → implement → update progress → pause for review).
- `PROGRESS.md` — per-feature checklist (spec/backend/frontend/lint); all 13 features checked off.
- `product/` — `vision.md` (what/theme/views/user model), `glossary.md` (Bug/Board/User terms), `braindump.md` (raw intentions/why), `README.md` index.
- `design/` — `theme.md` (primary color Savannah Beige `#b8ae76`; every modal needs an X + Escape-to-cancel), `README.md` index.
- `engineering/` — `tech-stack.md`, `coding-standards.md` (DDD, service-layer logic), `development-process.md`, `test-automation-patterns.md` (POM/fixtures rules), `pipelines.md` (CI spec — GH Actions, `npm test`, caching, HTML report artifacts), `api-conventions.md` (`/api` prefix on all endpoints), `gherkin-standards.md` (strict Given/When/Then, one behavior per scenario), `README.md` index.
- `features/` — 13 numbered specs (`01-favicon.md` → `13-bug-status.md`), each with user story + Gherkin acceptance criteria, plus `README.md` index and `wireframes.png`.

Source: `README.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/read-specs.mdc`, `specs/constitution.md`, `specs/design/theme.md`, `specs/engineering/api-conventions.md`, `specs/engineering/gherkin-standards.md`, `specs/product/glossary.md`.
