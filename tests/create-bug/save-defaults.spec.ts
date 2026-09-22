// plan: @specs/testing/create-bug-test-plan.md, scenario 2
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("saves a bug with the default severity and owner", async ({
  loginPage,
  boardPage,
  createBugModal,
  bugRecords,
}) => {
  const title = `Create bug default ${randomUUID()}`;
  const description = `Description for ${title}`;
  bugRecords.track(title);
  await loginPage.goto();
  await loginPage.login("rthompson", "password123");

  await boardPage.openCreateBug();
  await createBugModal.fillTitle(title);
  await createBugModal.fillDescription(description);
  await createBugModal.save();

  await expect(createBugModal.dialog).toBeHidden();
  const id = await boardPage.bugId(title);
  const row = boardPage.bugRows.filter({ hasText: title });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId(`bug-id-${id}`)).toHaveText(String(id));
  await expect(row.getByTestId(`bug-severity-${id}`)).toHaveText("MID");
  await expect(row.getByTestId(`bug-owner-${id}`)).toHaveText("rthompson");
  await boardPage.reload();
  await expect(boardPage.bugRows.filter({ hasText: title })).toHaveCount(1);
  await expect(bugRecords.get(id)).resolves.toMatchObject({
    title,
    severity: "MID",
    owner: "rthompson",
    description,
    state: "OPEN",
  });
});
