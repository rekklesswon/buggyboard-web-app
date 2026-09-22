// plan: @specs/testing/create-bug-test-plan.md, scenario 6
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

for (const field of ["Title", "Owner", "Description"] as const) {
  test(`rejects whitespace-only ${field}`, async ({
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
    await createBugModal.fillTitle(
      field === "Title" ? "   " : `Create bug ${marker}`
    );
    await createBugModal.fillOwner(
      field === "Owner" ? "   " : `owner-${marker}`
    );
    await createBugModal.fillDescription(
      field === "Description" ? "   " : `Description ${marker}`
    );
    await createBugModal.save();

    await expect(createBugModal.dialog).toBeVisible();
    await expect(createBugModal.errors).toContainText(`${field} is required.`);
    expect(await bugRecords.matching(marker)).toHaveLength(0);
  });
}
