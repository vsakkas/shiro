import { test as base, expect as baseExpect } from '@playwright/test';

// Editor content is written with "|" marking the caret, or two "|" marking a selection
const CARET = '|';

class Editor {
    constructor(page) {
        this.page = page;
        this.textarea = page.getByRole('textbox', { name: 'Writing area' });
    }

    async write(content) {
        const [start, end = start] = [...content.matchAll(/\|/g)].map((match, i) => match.index - i);
        await this.textarea.fill(content.replaceAll(CARET, ''));
        if (start === undefined) return;
        await this.textarea.evaluate((el, [start, end]) => el.setSelectionRange(start, end), [start, end]);
    }

    async content() {
        return this.textarea.evaluate(({ value, selectionStart, selectionEnd }) => {
            const selection = selectionStart === selectionEnd ? '' : value.slice(selectionStart, selectionEnd) + '|';
            return `${value.slice(0, selectionStart)}|${selection}${value.slice(selectionEnd)}`;
        });
    }

    async press(...keys) {
        for (const key of keys) await this.page.keyboard.press(key);
    }

    // Shiro binds its shortcuts to Cmd on Apple devices and Ctrl elsewhere
    async shortcut(keys) {
        const userAgent = await this.page.evaluate(() => navigator.userAgent);
        const modifier = /Mac|iPhone|iPad/.test(userAgent) ? 'Meta' : 'Control';
        await this.page.keyboard.press(`${modifier}+${keys}`);
    }

    // Undo is handled by the browser, so it follows the operating system rather than the user agent
    async undo() {
        await this.page.keyboard.press('ControlOrMeta+z');
    }

    async revealControls() {
        await this.page.mouse.move(10, 10);
        await this.page.mouse.move(20, 20);
    }

    button(name) {
        return this.page.getByRole('button', { name, exact: true });
    }

    async drop(name, text, type) {
        const dataTransfer = await this.page.evaluateHandle(([name, text, type]) => {
            const data = new DataTransfer();
            data.items.add(new File([text], name, { type }));
            return data;
        }, [name, text, type]);
        await this.textarea.dispatchEvent('drop', { dataTransfer });
    }
}

export const test = base.extend({
    editor: async ({ page }, use) => {
        await page.goto('/');
        await use(new Editor(page));
    },
});

export const expect = baseExpect.extend({
    async toHaveContent(editor, expected, options) {
        let actual;
        try {
            await baseExpect.poll(async () => (actual = await editor.content()), options).toBe(expected);
            return { pass: true, message: () => `Expected content not to be ${JSON.stringify(expected)}` };
        } catch {
            return {
                pass: false,
                name: 'toHaveContent',
                expected,
                actual,
                message: () => `Expected content: ${JSON.stringify(expected)}\nReceived content: ${JSON.stringify(actual)}`,
            };
        }
    },
});
