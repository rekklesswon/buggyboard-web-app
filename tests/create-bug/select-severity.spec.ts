// plan: @specs/testing/create-bug-test-plan.md, scenario 3
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";
import type { Severity } from "../pages/create-bug-modal";

for (const severity of ["HIGH", "LOW"] as Severity[]) {
  test(`saves an explicitly selected ${severity} severity`, async ({
    loginPage,
    boardPage,
    createBugModal,
    bugRecords,
  }) => {
    const title = `Create bug ${severity} ${randomUUID()}`;
    bugRecords.track(title);
    await loginPage.goto();
    await loginPage.login("rthompson", "password123");

    await boardPage.openCreateBug();
    await createBugModal.fillTitle(title);
    await createBugModal.fillDescription(`Description for ${title}`);
    await createBugModal.selectSeverity(severity);

    await expect(createBugModal.severitySelect).toHaveClass(
      new RegExp(`severity-select-${severity.toLowerCase()}`)
    );
    const expectedColor =
      severity === "HIGH" ? "rgb(184, 74, 46)" : "rgb(74, 107, 94)";
    await expect(createBugModal.severitySelect).toHaveCSS(
      "color",
      expectedColor
    );
    await createBugModal.save();

    const id = await boardPage.bugId(title);
    const row = boardPage.bugRows.filter({ hasText: title });
    const badge = row.getByTestId(`bug-severity-${id}`);
    await expect(badge).toHaveText(severity);
    await expect(badge).toHaveClass(
      new RegExp(`severity-badge-${severity.toLowerCase()}`)
    );
    await expect(badge).toHaveCSS("color", expectedColor);
    await expect(bugRecords.get(id)).resolves.toMatchObject({
      title,
      severity,
      state: "OPEN",
    });
  });
}
