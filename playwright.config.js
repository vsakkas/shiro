import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
    testDir: 'tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'en-US',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: devices['Desktop Chrome'], testIgnore: 'mobile.spec.js' },
        { name: 'firefox', use: devices['Desktop Firefox'], testIgnore: 'mobile.spec.js' },
        { name: 'webkit', use: devices['Desktop Safari'], testIgnore: 'mobile.spec.js' },
        { name: 'mobile', use: devices['iPhone 13'], testMatch: 'mobile.spec.js' },
    ],
    webServer: {
        command: `python3 -m http.server ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        // The server logs every request to stderr
        stderr: 'ignore',
    },
});
