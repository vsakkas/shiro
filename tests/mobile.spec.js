import { test, expect } from './fixtures.js';

test('control responds to first tap after typing', async ({ editor, page }) => {
    await editor.textarea.pressSequentially('one');
    const dialog = page.waitForEvent('dialog');
    page.once('dialog', dialog => dialog.dismiss());
    await editor.button('Clear').tap();
    await dialog;
});

test('count updates while typing', async ({ editor }) => {
    await editor.textarea.pressSequentially('one two');
    await expect(editor.button('2 words')).toBeVisible();
});
