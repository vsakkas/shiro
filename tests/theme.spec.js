import { test, expect } from './fixtures.js';

async function expectTheme(editor, theme) {
    await expect(editor.page.locator('html')).toHaveCSS('color-scheme', theme);
    await expect(editor.button(theme === 'dark' ? 'Light' : 'Dark')).toBeVisible();
}

test.describe('light system theme', () => {
    test.use({ colorScheme: 'light' });

    test('theme follows system', async ({ editor }) => {
        await expectTheme(editor, 'light');
    });

    test('theme follows system change', async ({ editor, page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await expectTheme(editor, 'dark');
    });

    test('theme button switches theme', async ({ editor }) => {
        await editor.button('Dark').click();
        await expectTheme(editor, 'dark');
    });

    test('theme button switches back', async ({ editor }) => {
        await editor.button('Dark').click();
        await editor.button('Light').click();
        await expectTheme(editor, 'light');
    });

    test('theme shortcut switches theme', async ({ editor }) => {
        await editor.shortcut('Shift+t');
        await expectTheme(editor, 'dark');
    });

    test('theme choice is restored after reload', async ({ editor, page }) => {
        await editor.button('Dark').click();
        await expectTheme(editor, 'dark');
        await page.reload();
        await expectTheme(editor, 'dark');
    });

    test('theme choice overrides system change', async ({ editor, page }) => {
        await editor.button('Dark').click();
        await expectTheme(editor, 'dark');
        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        await expectTheme(editor, 'dark');
    });
});

test.describe('dark system theme', () => {
    test.use({ colorScheme: 'dark' });

    test('theme follows system', async ({ editor }) => {
        await expectTheme(editor, 'dark');
    });

    test('theme follows system change', async ({ editor, page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await expectTheme(editor, 'light');
    });
});
