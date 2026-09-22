import type { Locator, Page } from "@playwright/test";

export type Severity = "HIGH" | "MID" | "LOW";

export class CreateBugModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly panel: Locator;
  readonly heading: Locator;
  readonly titleInput: Locator;
  readonly severitySelect: Locator;
  readonly severityOptions: Locator;
  readonly ownerInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly errors: Locator;
  readonly idField: Locator;
  readonly stateField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("create-bug-dialog");
    this.panel = page.getByTestId("create-bug-panel");
    this.heading = page.getByTestId("create-bug-heading");
    this.titleInput = page.getByTestId("create-bug-title");
    this.severitySelect = page.getByTestId("create-bug-severity");
    this.severityOptions = this.severitySelect.locator("option");
    this.ownerInput = page.getByTestId("create-bug-owner");
    this.descriptionInput = page.getByTestId("create-bug-description");
    this.saveButton = page.getByTestId("create-bug-save");
    this.cancelButton = page.getByTestId("create-bug-cancel");
    this.closeButton = page.getByTestId("create-bug-close");
    this.errors = page.getByTestId("create-bug-errors");
    this.idField = this.dialog.getByLabel("ID", { exact: true });
    this.stateField = this.dialog.getByLabel("State", { exact: true });
  }

  async fillTitle(value: string) {
    await this.titleInput.fill(value);
  }
  async selectSeverity(value: Severity) {
    await this.severitySelect.selectOption(value.toLowerCase());
  }
  async fillOwner(value: string) {
    await this.ownerInput.fill(value);
  }
  async fillDescription(value: string) {
    await this.descriptionInput.fill(value);
  }
  async save() {
    await this.saveButton.click();
  }
  async cancel() {
    await this.cancelButton.click();
  }
  async close() {
    await this.closeButton.click();
  }
  async escape() {
    await this.dialog.press("Escape");
  }

  async clickBackdrop() {
    await this.dialog.click({ position: { x: 2, y: 2 } });
  }
}
