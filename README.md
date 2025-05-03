# Todo Application with Playwright Tests

This is a simple Todo application built with Next.js, featuring end-to-end tests written using Playwright.

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd playwright_lab
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install Playwright browsers and dependencies:**
    This step downloads the necessary browser binaries (Chromium, Firefox, WebKit) and installs OS-level dependencies required by Playwright.
    ```bash
    npx playwright install --with-deps
    ```

## Running the Application (for Testing)

Before running the tests, you need to have the Next.js development server running:

```bash
npm run dev
# or
yarn dev
```

The application will typically be available at `http://localhost:3000`.

## Running Tests

Playwright provides several ways to run the tests located in the `tests/e2e/` directory.

1.  **Run all tests in UI Mode (Recommended for debugging):**
    Provides a visual interface to run, watch, and debug tests.
    ```bash
    npx playwright test --ui
    ```

2.  **Run all tests in Headless Mode:**
    Runs all tests in the background without opening browser windows. Results are printed to the console.
    ```bash
    npx playwright test
    ```

3.  **Run tests in Headed Mode:**
    Runs tests with browser windows visible.
    ```bash
    npx playwright test --headed
    ```

4.  **Run a specific test file:**
    ```bash
    npx playwright test tests/e2e/automation.spec.ts
    # or
    npx playwright test tests/e2e/network_interception.spec.ts
    ```

5.  **Run tests against a specific browser:**
    ```bash
    npx playwright test --project=chromium
    npx playwright test --project=firefox
    npx playwright test --project=webkit
    ```

After running tests headlessly, a detailed HTML report is generated in the `playwright-report/` directory. You can open `playwright-report/index.html` in your browser to view it.

## Test Structure

*   End-to-end tests are located in the `tests/e2e/` directory.
*   Tests primarily use `data-testid` attributes added to the React components for robust element selection. This makes tests less brittle to UI changes (styling, text labels).
*   Helper functions (like `addTodo`) are used to reduce code duplication.
*   Confirmation dialogs (`window.confirm`) are handled using `page.once('dialog', ...)` within the tests.

### Test Files

*   `tests/e2e/automation.spec.ts`: Contains tests for the core CRUD (Create, Read, Update, Delete) functionality of the Todo application, including adding, completing, uncompleting, archiving, and deleting items.
*   `tests/e2e/network_interception.spec.ts`: Demonstrates Playwright's network interception capabilities, including modifying HTML responses and aborting specific asset requests.
