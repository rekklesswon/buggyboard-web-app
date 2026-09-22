// plan: @specs/testing/create-bug-test-plan.md, scenario 10
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("preserves a draft on backdrop click", async ({
  loginPage,
  boardPage,
  createBugModal,
  bugRecords,
}) => {
  const marker = randomUUID();
  const title = `Create bug ${marker}`;
  const description = `Description ${marker}`;
  bugRecords.track(marker);
  await loginPage.goto();
  await loginPage.login("rthompson", "password123");

  await boardPage.openCreateBug();
  await createBugModal.fillTitle(title);
  await createBugModal.fillDescription(description);
  await createBugModal.clickBackdrop();

  await expect(createBugModal.dialog).toBeVisible();
  await expect(createBugModal.titleInput).toHaveValue(title);
  await expect(createBugModal.descriptionInput).toHaveValue(description);
  await createBugModal.cancel();
  expect(await bugRecords.matching(marker)).toHaveLength(0);
});
