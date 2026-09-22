import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { BoardPage } from "../pages/board-page";
import { CreateBugModal } from "../pages/create-bug-modal";
import { BugRecords } from "./bug-records";

type PageObjectFixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  bugRecords: BugRecords;
};

export const test = base.extend<PageObjectFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
  createBugModal: async ({ page }, use) => {
    await use(new CreateBugModal(page));
  },
  bugRecords: async ({ request }, use) => {
    const records = new BugRecords(request);
    await use(records);
    await records.cleanup();
  },
});

export { expect };
