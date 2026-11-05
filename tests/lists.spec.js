import { test, expect } from './fixtures.js';

test('enter continues bullet list', async ({ editor }) => {
    await editor.write('- one|');
    await editor.press('Enter');
    await expect(editor).toHaveContent('- one\n- |');
});

test('enter continues star list', async ({ editor }) => {
    await editor.write('* one|');
    await editor.press('Enter');
    await expect(editor).toHaveContent('* one\n* |');
});

test('enter continues numbered list', async ({ editor }) => {
    await editor.write('1. one|');
    await editor.press('Enter');
    await expect(editor).toHaveContent('1. one\n2. |');
});

test('enter continues nested list', async ({ editor }) => {
    await editor.write('- one\n\t- two|');
    await editor.press('Enter');
    await expect(editor).toHaveContent('- one\n\t- two\n\t- |');
});

test('enter splits list item', async ({ editor }) => {
    await editor.write('- one| two');
    await editor.press('Enter');
    await expect(editor).toHaveContent('- one\n- | two');
});

test('enter on empty item ends list', async ({ editor }) => {
    await editor.write('- one\n- |');
    await editor.press('Enter');
    await expect(editor).toHaveContent('- one\n|');
});

test('enter on empty nested item outdents', async ({ editor }) => {
    await editor.write('- one\n\t- |');
    await editor.press('Enter');
    await expect(editor).toHaveContent('- one\n- |');
});

test('enter outside list inserts newline', async ({ editor }) => {
    await editor.write('one|');
    await editor.press('Enter');
    await expect(editor).toHaveContent('one\n|');
});

test('shift enter breaks out of list', async ({ editor }) => {
    await editor.write('- one|');
    await editor.press('Shift+Enter');
    await expect(editor).toHaveContent('- one\n|');
});

test('backspace on empty item removes marker', async ({ editor }) => {
    await editor.write('- one\n- |');
    await editor.press('Backspace');
    await expect(editor).toHaveContent('- one\n|');
});

test('backspace on filled item deletes character', async ({ editor }) => {
    await editor.write('- one|');
    await editor.press('Backspace');
    await expect(editor).toHaveContent('- on|');
});

test('tab indents list item', async ({ editor }) => {
    await editor.write('- one\n- tw|o');
    await editor.press('Tab');
    await expect(editor).toHaveContent('- one\n\t- tw|o');
});

test('shift tab outdents list item', async ({ editor }) => {
    await editor.write('- one\n\t- tw|o');
    await editor.press('Shift+Tab');
    await expect(editor).toHaveContent('- one\n- tw|o');
});

test('shift tab outdents list item indented with spaces', async ({ editor }) => {
    await editor.write('- one\n    - tw|o');
    await editor.press('Shift+Tab');
    await expect(editor).toHaveContent('- one\n- tw|o');
});

test('tab outside list inserts tab', async ({ editor }) => {
    await editor.write('one|');
    await editor.press('Tab');
    await expect(editor).toHaveContent('one\t|');
});

test('tab indents selected lines', async ({ editor }) => {
    await editor.write('|one\ntwo|');
    await editor.press('Tab');
    await expect(editor).toHaveContent('|\tone\n\ttwo|');
});

test('shift tab outdents selected lines', async ({ editor }) => {
    await editor.write('|\tone\n\ttwo|');
    await editor.press('Shift+Tab');
    await expect(editor).toHaveContent('|one\ntwo|');
});

test('undo reverts list continuation in one step', async ({ editor, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit undoes the whole typing run at once');
    await editor.write('- one|');
    await editor.press('Enter');
    await editor.undo();
    await expect(editor.textarea).toHaveValue('- one');
});

test('undo reverts indent in one step', async ({ editor, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit undoes the whole typing run at once');
    await editor.write('- one\n- two|');
    await editor.press('Tab');
    await editor.undo();
    await expect(editor.textarea).toHaveValue('- one\n- two');
});
