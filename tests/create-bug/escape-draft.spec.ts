// plan: @specs/testing/create-bug-test-plan.md, scenario 9
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("discards a draft with Escape", async ({
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
  await createBugModal.escape();

  await expect(createBugModal.dialog).toBeHidden();
  expect(await bugRecords.matching(marker)).toHaveLength(0);
});
