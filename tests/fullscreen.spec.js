import { test, expect } from './fixtures.js';

test('fullscreen button enters and leaves fullscreen', async ({ editor, page }) => {
    const fullscreenEnabled = await page.evaluate(() => document.fullscreenEnabled);
    test.skip(!fullscreenEnabled, 'Fullscreen is not supported in this browser');
    await editor.button('Fullscreen').click();
    await expect(editor.button('Normal')).toBeVisible();
    await editor.button('Normal').click();
    await expect(editor.button('Fullscreen')).toBeVisible();
});

test('fullscreen shortcut enters fullscreen', async ({ editor, page }) => {
    const fullscreenEnabled = await page.evaluate(() => document.fullscreenEnabled);
    test.skip(!fullscreenEnabled, 'Fullscreen is not supported in this browser');
    await editor.shortcut('Shift+f');
    await expect(editor.button('Normal')).toBeVisible();
});
