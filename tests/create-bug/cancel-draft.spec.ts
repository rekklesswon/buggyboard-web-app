// plan: @specs/testing/create-bug-test-plan.md, scenario 7
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("discards a draft on Cancel and resets the next form", async ({
  loginPage,
  boardPage,
  createBugModal,
  bugRecords,
}) => {
  const marker = randomUUID();
  bugRecords.track(marker);
  await loginPage.goto();
  await loginPage.login("rthompson", "password123");

  await boardPage.openCreateBug();
  await createBugModal.fillTitle(`Create bug ${marker}`);
  await createBugModal.fillDescription(`Description ${marker}`);
  await createBugModal.selectSeverity("HIGH");
  await createBugModal.fillOwner(`owner-${marker}`);
  await createBugModal.cancel();

  await expect(createBugModal.dialog).toBeHidden();
  expect(await bugRecords.matching(marker)).toHaveLength(0);
  await boardPage.openCreateBug();
  await expect(createBugModal.titleInput).toBeEmpty();
  await expect(createBugModal.descriptionInput).toBeEmpty();
  await expect(createBugModal.severitySelect).toHaveValue("mid");
  await expect(createBugModal.ownerInput).toHaveValue("rthompson");
});
