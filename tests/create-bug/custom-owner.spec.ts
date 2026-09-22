// plan: @specs/testing/create-bug-test-plan.md, scenario 4
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";

test("saves a custom owner", async ({
  loginPage,
  boardPage,
  createBugModal,
  bugRecords,
}) => {
  const title = `Create bug owner ${randomUUID()}`;
  const owner = `owner-${randomUUID()}`;
  bugRecords.track(title);
  await loginPage.goto();
  await loginPage.login("rthompson", "password123");

  await boardPage.openCreateBug();
  await createBugModal.fillTitle(title);
  await createBugModal.fillOwner(owner);
  await createBugModal.fillDescription(`Description for ${title}`);
  await createBugModal.save();

  const id = await boardPage.bugId(title);
  await expect(
    boardPage.bugRows.filter({ hasText: title }).getByTestId(`bug-owner-${id}`)
  ).toHaveText(owner);
  await expect(bugRecords.get(id)).resolves.toMatchObject({ title, owner });
});
