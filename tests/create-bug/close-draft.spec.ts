// plan: @specs/testing/create-bug-test-plan.md, scenario 8
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("discards a draft with the Close button", async ({
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
  await createBugModal.close();

  await expect(createBugModal.dialog).toBeHidden();
  expect(await bugRecords.matching(marker)).toHaveLength(0);
});
