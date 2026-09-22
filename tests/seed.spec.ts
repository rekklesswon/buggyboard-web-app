import { test, expect } from './fixtures';

test('seed', async ({ loginPage, boardPage }) => {
  await loginPage.goto();
  await loginPage.login('rthompson', 'password123');

  await expect(boardPage.bugTable).toBeVisible();
});
