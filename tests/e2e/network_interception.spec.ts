import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000'; // Adjust if needed

test.describe('Network Interception', () => {

  test('should modify the response of the main page', async ({ page }) => {
    const modificationMarker = '<!-- Modified by Playwright Test -->';

    // Intercept the main HTML request
    await page.route(baseURL + '/', async route => {
      console.log(`Intercepting: ${route.request().url()}`);
      try {
        const response = await route.fetch(); // Fetch original response
        let body = await response.text();

        // Modify the body
        body = body.replace('</body>', `${modificationMarker}</body>`);

        // Fulfill the request with the modified body
        await route.fulfill({
          response: response, // Use original response object for headers, status etc.
          body: body,
        });
      } catch (error) {
        console.error("Failed to intercept or modify route:", error);
        // If fetching fails, continue the request without modification
        await route.continue();
      }
    });

    // Navigate to the page AFTER setting up the route
    await page.goto(baseURL + '/');

    // Verify the modification
    const pageContent = await page.content();
    expect(pageContent).toContain(modificationMarker);

    // Optional: Verify something specific isn't broken by the modification
    await expect(page.locator('h1')).toBeVisible(); // Check if main heading is still there
  });

});
