import { test, expect } from '@playwright/test';


test('homepage loads and has canvas', async ({ page }) => {
await page.goto('http://localhost:5173');
await expect(page.locator('canvas')).toHaveCount(1);
// take a snapshot for visual regression
expect(await page.screenshot()).toMatchSnapshot('homepage.png');
});