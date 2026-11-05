import { test, expect } from './fixtures.js';

test('text is restored after reload', async ({ editor, page }) => {
    await editor.write('one\ntwo');
    await page.reload();
    await expect(editor.textarea).toHaveValue('one\ntwo');
});

test('caret is restored after reload', async ({ editor, page, browserName }) => {
    test.fail(browserName === 'chromium', 'Loading the text moves the caret to the end and saves that position first');
    await editor.write('one\ntwo');
    // Shiro saves the caret on selectionchange, which browsers fire asynchronously
    await editor.textarea.evaluate(el => new Promise(resolve => {
        document.addEventListener('selectionchange', resolve, { once: true });
        el.setSelectionRange(6, 6);
    }));
    await page.reload();
    await expect(editor).toHaveContent('one\ntw|o');
});

test('editor is focused on first visit', async ({ editor }) => {
    test.fail(true, 'The editor is still hidden while the text loads, so focusing it has no effect');
    await expect(editor.textarea).toBeFocused();
});

test('typing anywhere writes in the editor', async ({ editor, page }) => {
    await editor.textarea.blur();
    await page.keyboard.type('one');
    await expect(editor.textarea).toHaveValue('one');
});
