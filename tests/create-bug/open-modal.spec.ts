// plan: @specs/testing/create-bug-test-plan.md, scenario 1
import { test, expect } from "../fixtures";

test("opens a fresh Create bug dialog with defaults", async ({
  loginPage,
  boardPage,
  createBugModal,
}) => {
  await loginPage.goto();
  await loginPage.login("rthompson", "password123");

  await boardPage.openCreateBug();

  await expect(createBugModal.dialog).toBeVisible();
  await expect(createBugModal.heading).toHaveText("Create bug");
  await expect(createBugModal.titleInput).toBeEmpty();
  await expect(createBugModal.descriptionInput).toBeEmpty();
  await expect(createBugModal.severitySelect).toHaveValue("mid");
  await expect(createBugModal.severityOptions).toHaveText([
    "HIGH",
    "MID",
    "LOW",
  ]);
  await expect(createBugModal.ownerInput).toHaveValue("rthompson");
  await expect(createBugModal.saveButton).toBeVisible();
  await expect(createBugModal.cancelButton).toBeVisible();
  await expect(createBugModal.closeButton).toBeVisible();
  await expect(createBugModal.idField).toHaveCount(0);
  await expect(createBugModal.stateField).toHaveCount(0);
});
