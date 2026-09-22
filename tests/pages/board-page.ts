import type { Locator, Page } from "@playwright/test";

export class BoardPage {
  readonly page: Page;
  readonly bugTable: Locator;
  readonly newBugButton: Locator;
  readonly bugRows: Locator;
  readonly openFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bugTable = page.getByTestId("bug-table");
    this.newBugButton = page.getByTestId("new-bug-button");
    this.bugRows = page.getByTestId(/^bug-row-/);
    this.openFilter = page.getByTestId("board-open-filter");
  }

  async openCreateBug() {
    await this.newBugButton.click();
  }

  async reload() {
    await this.page.reload();
    await this.bugTable.waitFor();
  }

  async bugId(title: string): Promise<number> {
    const row = this.bugRows.filter({ hasText: title });
    await row.waitFor();
    const id = Number(await row.getAttribute("data-bug-id"));
    if (!Number.isInteger(id) || id < 1)
      throw new Error(`No numeric bug ID for ${title}`);
    return id;
  }
}
