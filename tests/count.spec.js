import { test, expect } from './fixtures.js';

test('count shows zero words on empty editor', async ({ editor }) => {
    await expect(editor.button('0 words')).toBeVisible();
});

test('count shows single word', async ({ editor }) => {
    await editor.write('one');
    await editor.revealControls();
    await expect(editor.button('1 word')).toBeVisible();
});

test('count shows words', async ({ editor }) => {
    await editor.write('one two, three.\n\nfour-five');
    await editor.revealControls();
    await expect(editor.button('5 words')).toBeVisible();
});

test('count formats thousands', async ({ editor }) => {
    await editor.write('word '.repeat(1234));
    await editor.revealControls();
    await expect(editor.button('1,234 words')).toBeVisible();
});

test('count shows selected words', async ({ editor }) => {
    await editor.write('one |two three| four');
    await editor.revealControls();
    await expect(editor.button('2 of 4 words')).toBeVisible();
});

test('count shows reading time', async ({ editor }) => {
    await editor.write('word '.repeat(401));
    await editor.revealControls();
    await editor.button('401 words').click();
    await expect(editor.button('~3 minutes')).toBeVisible();
});

test('count shows reading time under a minute', async ({ editor }) => {
    await editor.button('0 words').click();
    await expect(editor.button('<1 minute')).toBeVisible();
});

test('count switches back to words', async ({ editor }) => {
    await editor.button('0 words').click();
    await editor.button('<1 minute').click();
    await expect(editor.button('0 words')).toBeVisible();
});

test('count mode is restored after reload', async ({ editor, page }) => {
    await editor.button('0 words').click();
    await expect(editor.button('<1 minute')).toBeVisible();
    await page.reload();
    await expect(editor.button('<1 minute')).toBeVisible();
});
