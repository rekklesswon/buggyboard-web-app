# Create Bug Test Plan

**Feature:** `specs/features/06-create-bug.md`  
**Seed:** `tests/seed.spec.ts`  
**App:** `http://localhost:5173` (Chromium project)

## Starting State and Test Data

Run the seed for each scenario to reach `/board` signed in as `rthompson`. Use a fresh browser context and a unique bug title for each test. The SQLite database persists between runs, so no scenario may assume that the board is empty or that the next bug ID is 1. Capture the ID of every bug the test creates and delete only that bug during teardown through `DELETE /api/bugs/:id`. Confirm it is absent afterward. Tests should use the page objects and shared fixtures required by `specs/engineering/test-automation-patterns.md`.

The create dialog has a Title textbox, a Severity dropdown with HIGH, MID, and LOW, an Owner textbox, and a Description textbox. MID is selected by default; Owner is prefilled with the signed-in username. The dialog also has Save, Cancel, and Close controls. ID and State are assigned by the app rather than entered in this dialog.

## Scenarios

### 1. Open the Create Bug dialog

**Seed:** `tests/seed.spec.ts`  
**Action:** Click **New Bug** in the board title bar.

**Expected:** A dialog headed **Create bug** opens. Title and Description are empty, Severity offers HIGH/MID/LOW with MID selected, Owner contains `rthompson`, and Save, Cancel, and Close are available. There is no editable ID or State field.

### 2. Save a valid bug with the defaults

**Seed:** `tests/seed.spec.ts`  
**Data:** Unique title such as `Create bug default <unique>`, nonblank description; leave Severity at MID and Owner at `rthompson`.

**Steps:** Open the dialog, fill Title and Description, click **Save**, then reload `/board`.

**Expected:** The dialog closes. The Open board shows exactly one row for the unique title, with MID severity, owner `rthompson`, and a numeric ID. The row remains after reload. Reading that ID through the API shows the submitted description and `OPEN` state.

**Cleanup:** Delete the captured ID and verify the unique title is absent.

### 3. Save each explicitly selected severity

**Seed:** `tests/seed.spec.ts`  
**Examples:** Run separate tests for HIGH and LOW, each with a unique title.

**Steps:** Open the dialog, fill the required fields, select the example severity, and save.

**Expected:** The created row and saved API record use the selected uppercase severity. The create control and board badge use the corresponding severity styling from `specs/features/08-board-severity.md`.

**Cleanup:** Delete each test's captured ID.

### 4. Save a custom owner

**Seed:** `tests/seed.spec.ts`  
**Steps:** Open the dialog, replace the default Owner with a different nonblank name, fill Title and Description, and save.

**Expected:** The created board row and saved API record show the entered owner, not `rthompson`.

**Cleanup:** Delete the captured ID.

### 5. Reject an empty required field

**Seed:** `tests/seed.spec.ts`  
**Examples:** Run independent tests with Title, Owner, or Description empty. Fill the other required fields with valid values.

**Action:** Click **Save**.

**Expected:** The dialog stays open, an alert names the empty field as required, and no bug with the test's unique title is created. When Title is the empty field, use a unique description or owner to check the API for accidental creation.

### 6. Reject whitespace-only required text

**Seed:** `tests/seed.spec.ts`  
**Examples:** Run independent tests with Title, Owner, or Description containing only spaces. Fill the other fields with valid values.

**Action:** Click **Save**.

**Expected:** The dialog stays open, the field is reported as required, and no bug is created. This checks the app's trimmed-field validation rather than accepting visible whitespace as content.

### 7. Cancel a draft

**Seed:** `tests/seed.spec.ts`  
**Steps:** Open the dialog, enter a unique Title and Description, click **Cancel**, then reopen **New Bug**.

**Expected:** The first dialog closes without creating the bug. The reopened form has blank Title and Description, MID severity, and the default owner.

### 8. Close a draft with X

**Seed:** `tests/seed.spec.ts`  
**Steps:** Open the dialog, enter a unique Title and Description, then click the **Close** button in its header.

**Expected:** The dialog closes and no bug with that title is created.

### 9. Close a draft with Escape

**Seed:** `tests/seed.spec.ts`  
**Steps:** Open the dialog, enter a unique Title and Description, then press Escape.

**Expected:** The dialog closes and no bug with that title is created.

### 10. Preserve a draft on backdrop click

**Seed:** `tests/seed.spec.ts`  
**Steps:** Open the dialog, enter a unique Title and Description, then click the dimmed backdrop outside the dialog panel.

**Expected:** The dialog remains open with the entered values unchanged. Cancel afterward; no bug is created.

## Coverage Notes

- The UI Severity dropdown has no blank option, so a blank-severity rejection cannot be exercised through this form. Cover invalid or missing severity separately at the API layer if needed.
- Keep each generated test focused on one scenario. Use a `CreateBugModal` page object and add it to `tests/fixtures/index.ts`; keep assertions in the spec files.
- Live Playwright CLI exploration on 2026-09-22 confirmed the seed login, initial defaults, empty-form validation, cancel/reset, a HIGH-severity create, persistence after reload, and cleanup of the uniquely named probe bug. X, Escape, backdrop, custom-owner, LOW-severity, and whitespace-only cases are planned from the feature specs and source and have not yet been exercised in the browser.
