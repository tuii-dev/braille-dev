import { Page, expect } from "@playwright/test";

import { FieldDataTypeEnum, FieldDataTypeEnumType } from "@jptr/braille-prisma";

export class ModelEditor {
  private page: Page;
  private newFieldForm: ReturnType<Page['getByRole']>;
  public modelEditGrid: ReturnType<Page['getByTestId']>;

  private constructor(page: Page) {
    this.page = page;
    this.newFieldForm = this.page.getByRole("form", { name: "Add field" });
    this.modelEditGrid = this.page.getByTestId("model-edit-grid");
  }

  async clickAddField() {
    await this.page.getByRole("button", { name: "Add Field" }).click();
  }

  async fillLabel(value: string) {
    await this.page.getByRole("textbox", { name: "Field Name" }).fill(value);
  }

  async fillDescription(value: string) {
    await this.page.getByRole("textbox", { name: "Description" }).fill(value);
  }

  async fillSystemName(value: string) {
    await this.page.getByRole("textbox", { name: "System Name" }).fill(value);
  }

  getFieldTypeLabel(type: FieldDataTypeEnumType) {
    switch (type) {
      case FieldDataTypeEnum.STRING:
        return "Text";
      case FieldDataTypeEnum.DATE:
        return "Date";
      case FieldDataTypeEnum.NUMBER:
        return "Number";
      case FieldDataTypeEnum.BOOLEAN:
        return "Yes / No";
      case FieldDataTypeEnum.CURRENCY:
        return "Currency";
      case FieldDataTypeEnum.ARRAY:
        return "Collection";
      case FieldDataTypeEnum.OBJECT:
        return "Object";
      case FieldDataTypeEnum.ENUM:
        return "Choice";
    }
    throw new Error(`Unknown field type: ${type}`);
  }

  async fillType(value: FieldDataTypeEnumType) {
    // Get the combobox and ensure it's ready
    const combobox = this.page.getByRole("combobox");
    await combobox.waitFor({ state: "visible" });
    await combobox.click();

    // Get the option and ensure it's ready
    const optionText = this.getFieldTypeLabel(value);
    const option = this.page.getByRole("option", { name: optionText });
    
    // Wait for the option to be available and click it
    await expect(option).toBeVisible({ timeout: 5000 });
    await expect(option).toBeEnabled({ timeout: 5000 });
    await option.click();
    
    // Verify the selection was made
    await expect(combobox).toHaveText(optionText);
  }

  async addField({
    label,
    description,
    type,
    systemName,
  }: {
    label: string;
    description: string;
    type: FieldDataTypeEnumType;
    systemName: string;
  }) {
    await this.clickAddField();
    await expect(this.newFieldForm).toBeVisible();
    
    // Wait for all form fields to be visible and interactable
    await this.page.getByRole("textbox", { name: "Field Name" }).waitFor({ state: "visible" });
    await this.page.getByRole("textbox", { name: "Description" }).waitFor({ state: "visible" });
    await this.page.getByRole("combobox").waitFor({ state: "visible" });
    await this.page.getByRole("textbox", { name: "System Name" }).waitFor({ state: "visible" });

    await this.fillLabel(label);
    await this.fillDescription(description);
    await this.fillType(type);
    await this.fillSystemName(systemName);
    
    // Click Add Field and wait for form to be removed
    await this.clickAddField();
    await this.newFieldForm.waitFor({ state: "detached" });
  }

  static from(page: Page) {
    return new ModelEditor(page);
  }
}