import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures.js';

const FILE_NAME = /^shiro_notes_on_\d{4}-\d{2}-\d{2}_at_\d{2}-\d{2}\.txt$/;

async function chooseFile(editor, open, file) {
    const fileChooser = editor.page.waitForEvent('filechooser');
    await open();
    await (await fileChooser).setFiles({ mimeType: 'text/plain', buffer: Buffer.from(file.text), ...file });
}

test('file button opens on empty editor', async ({ editor }) => {
    await expect(editor.button('Open')).toBeVisible();
});

test('file button downloads with text', async ({ editor }) => {
    await editor.write('one');
    await editor.revealControls();
    await expect(editor.button('Download')).toBeVisible();
});

test('file button opens again after deleting text', async ({ editor }) => {
    await editor.write('one|');
    await editor.press('Backspace', 'Backspace', 'Backspace');
    await editor.revealControls();
    await expect(editor.button('Open')).toBeVisible();
});

test('download saves text', async ({ editor, page }) => {
    await editor.write('one\ntwo');
    await editor.revealControls();
    const download = page.waitForEvent('download');
    await editor.button('Download').click();
    expect((await download).suggestedFilename()).toMatch(FILE_NAME);
    expect(await readFile(await (await download).path(), 'utf8')).toBe('one\ntwo');
});

test('download shortcut saves text', async ({ editor, page }) => {
    await editor.write('one');
    const download = page.waitForEvent('download');
    await editor.shortcut('s');
    expect(await readFile(await (await download).path(), 'utf8')).toBe('one');
});

test('open loads file', async ({ editor }) => {
    await chooseFile(editor, () => editor.button('Open').click(), { name: 'notes.txt', text: 'one\ntwo' });
    await expect(editor.textarea).toHaveValue('one\ntwo');
});

test('open shortcut loads file', async ({ editor }) => {
    await chooseFile(editor, () => editor.shortcut('o'), { name: 'notes.md', text: '# one' });
    await expect(editor.textarea).toHaveValue('# one');
});

test('open loads markdown file without text type', async ({ editor }) => {
    await chooseFile(editor, () => editor.button('Open').click(), { name: 'notes.md', mimeType: '', text: '# one' });
    await expect(editor.textarea).toHaveValue('# one');
});

test('open replaces text after confirmation', async ({ editor, page }) => {
    await editor.write('one');
    page.once('dialog', dialog => dialog.accept());
    await chooseFile(editor, () => editor.shortcut('o'), { name: 'notes.txt', text: 'two' });
    await expect(editor.textarea).toHaveValue('two');
});

test('open keeps text when cancelled', async ({ editor, page }) => {
    await editor.write('one');
    const dialog = page.waitForEvent('dialog');
    page.once('dialog', dialog => dialog.dismiss());
    await chooseFile(editor, () => editor.shortcut('o'), { name: 'notes.txt', text: 'two' });
    await dialog;
    await expect(editor.textarea).toHaveValue('one');
});

test('open can be undone', async ({ editor, page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit undoes the whole typing run at once');
    await editor.write('one');
    page.once('dialog', dialog => dialog.accept());
    await chooseFile(editor, () => editor.shortcut('o'), { name: 'notes.txt', text: 'two' });
    await expect(editor.textarea).toHaveValue('two');
    await editor.undo();
    await expect(editor.textarea).toHaveValue('one');
});

test('drop loads text file', async ({ editor }) => {
    await editor.drop('notes.csv', 'one,two', 'text/csv');
    await expect(editor.textarea).toHaveValue('one,two');
});

test('drop ignores other files', async ({ editor }) => {
    await editor.write('one');
    await editor.drop('image.png', 'binary', 'image/png');
    await expect(editor.textarea).toHaveValue('one');
});
