import { test, expect } from './fixtures.js';

test('clear removes text after confirmation', async ({ editor, page }) => {
    await editor.write('one');
    await editor.revealControls();
    page.once('dialog', dialog => dialog.accept());
    await editor.button('Clear').click();
    await expect(editor.textarea).toHaveValue('');
});

test('clear keeps text when cancelled', async ({ editor, page }) => {
    await editor.write('one');
    await editor.revealControls();
    const dialog = page.waitForEvent('dialog');
    page.once('dialog', dialog => dialog.dismiss());
    await editor.button('Clear').click();
    await dialog;
    await expect(editor.textarea).toHaveValue('one');
});

test('clear shortcut removes text', async ({ editor, page }) => {
    await editor.write('one');
    page.once('dialog', dialog => dialog.accept());
    await editor.shortcut('k');
    await expect(editor.textarea).toHaveValue('');
});

test('clear can be undone', async ({ editor, page }) => {
    await editor.write('one');
    page.once('dialog', dialog => dialog.accept());
    await editor.shortcut('k');
    await expect(editor.textarea).toHaveValue('');
    await editor.undo();
    await expect(editor.textarea).toHaveValue('one');
});

test('clear is saved', async ({ editor, page }) => {
    await editor.write('one');
    page.once('dialog', dialog => dialog.accept());
    await editor.shortcut('k');
    await expect(editor.textarea).toHaveValue('');
    await page.reload();
    await expect(editor.textarea).toHaveValue('');
});
