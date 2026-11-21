export interface CodingChallenge {
    id: string
    titleEn: string
    titleUk: string
    titleRu: string
    level: 'junior' | 'middle' | 'senior'
    category: string
    timeLimitMinutes: number
    goalEn: string
    goalUk: string
    goalRu: string
    instructionsEn: string[]
    instructionsUk: string[]
    instructionsRu: string[]
    starterCode: string
    solutionCode: string
    hintsEn: string[]
    hintsUk: string[]
    hintsRu: string[]
}

export const CODING_CHALLENGES: CodingChallenge[] = [
    {
        id: "challenge-flaky-checkout",
        titleEn: "Fix Flaky Cart & Eliminate waitForTimeout",
        titleUk: "Виправлення нестабільного тесту кошика (Flakiness & Race Conditions)",
        titleRu: "Исправление нестабильного теста корзины (Flakiness & Race Conditions)",
        level: "junior",
        category: "Debugging & Auto-waiting",
        timeLimitMinutes: 12,
        goalEn: "Refactor a flaky e-commerce test by removing hardcoded sleeps, replacing fragile XPath with user-centric locators, and applying Web-First auto-retrying assertions.",
        goalUk: "Виправте нестабільний тест кошика: позбудьтеся жорстких пауз (sleep), замініть крихкі XPath на рольові локатори та використайте Web-First асершни з автоматичним повторенням.",
        goalRu: "Исправьте нестабильный тест корзины: удалите жесткие паузы (sleep), замените хрупкие XPath на ролевые локаторы и примените Web-First ассерты с авто-повторением.",
        instructionsEn: [
            "Remove all 'page.waitForTimeout()' anti-patterns.",
            "Replace fragile XPath '//button[contains(@class, \"btn-cart\")]' with resilient 'page.getByRole()' or 'getByTestId()'.",
            "Fix the race condition on async cart price calculation by replacing imperative 'expect(await locator.innerText()).toBe(...)' with 'await expect(locator).toHaveText(...)'.",
            "Ensure the test runs deterministically under high CI network latency."
        ],
        instructionsUk: [
            "Повністю видаліть анти-патерн 'page.waitForTimeout()'.",
            "Замініть крихкий XPath '//button[contains(@class, \"btn-cart\")]' на людиноорієнтований 'page.getByRole()' або 'getByTestId()'.",
            "Усуньте стан гонитви (race condition) при розрахунку суми кошика: замініть імперативний 'expect(await locator.innerText()).toBe(...)' на web-first 'await expect(locator).toHaveText(...)'.",
            "Переконайтеся, що тест стабільно проходить в умовах мережевих затримок."
        ],
        instructionsRu: [
            "Полностью удалите анти-паттерн 'page.waitForTimeout()'.",
            "Замените хрупкий XPath '//button[contains(@class, \"btn-cart\")]' на человекоориентированный 'page.getByRole()' или 'getByTestId()'.",
            "Устраните гонку состояний (race condition) при расчете корзины: замените 'expect(await locator.innerText()).toBe(...)' на web-first 'await expect(locator).toHaveText(...)'.",
            "Обеспечьте стабильность прогона теста при сетевых задержках в CI."
        ],
        starterCode: `import { test, expect } from '@playwright/test';

// ❌ FLAKY CODE: Candidate must refactor during the interview
test('Flaky Cart Checkout under network lag', async ({ page }) => {
    await page.goto('https://ecommerce.example.com/products/headphones');

    // Anti-pattern 1: Static arbitrary sleep to wait for button render
    await page.waitForTimeout(3000);

    // Anti-pattern 2: Brittle, coupled XPath locator
    const addBtn = page.locator('//div[contains(@class, "product-view")]//button[1]');
    await addBtn.click();

    // Anti-pattern 3: Waiting for drawer animation with sleep
    await page.waitForTimeout(2000);

    // Anti-pattern 4: Imperative instant assertion (fails when price recalculated via AJAX)
    const cartTotal = page.locator('#header-cart-total-badge');
    const text = await cartTotal.innerText();
    expect(text).toBe('$199.00');

    // Proceed to checkout button
    await page.click('button.checkout-btn');
    await expect(page).toHaveURL(/.*checkout/);
});
`,
        solutionCode: `import { test, expect } from '@playwright/test';

// ✅ REFACTORED LEAD-GRADE SOLUTION
test('Reliable Cart Checkout with Web-First Assertions', async ({ page }) => {
    await page.goto('https://ecommerce.example.com/products/headphones');

    // 1. Resilient user-facing locator with automatic actionability checks
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();

    // 2. Web-first auto-retrying assertion: polls the DOM until AJAX finishes
    const cartBadge = page.getByRole('status', { name: /cart total/i })
        .or(page.locator('#header-cart-total-badge'));
    await expect(cartBadge).toHaveText('$199.00');

    // 3. User-facing action with built-in navigation expectation
    const checkoutButton = page.getByRole('button', { name: /checkout/i });
    await checkoutButton.click();

    await expect(page).toHaveURL(/.*checkout/);
});
`,
        hintsEn: [
            "Use page.getByRole('button', { name: /add to cart/i }) instead of fragile DOM traversal.",
            "Web-first assertions like await expect(locator).toHaveText('$199.00') will automatically wait for AJAX calculations."
        ],
        hintsUk: [
            "Використовуйте page.getByRole('button', { name: /add to cart/i }) замість прив'язки до класів верстки.",
            "Web-first асершн await expect(locator).toHaveText('$199.00') автоматично дочекається перерахунку суми без жодного sleep."
        ],
        hintsRu: [
            "Используйте page.getByRole('button', { name: /add to cart/i }) вместо хрупкого поиска по классам.",
            "Web-first ассерт await expect(locator).toHaveText('$199.00') автоматически дождется завершения AJAX перерасчета."
        ]
    },
    {
        id: "challenge-pom-refactor",
        titleEn: "Refactor Monolithic Script to Page Object Model",
        titleUk: "Рефакторинг монолітного скрипта в Page Object Model (POM)",
        titleRu: "Рефакторинг монолитного скрипта в Page Object Model (POM)",
        level: "middle",
        category: "Architecture & Design Patterns",
        timeLimitMinutes: 15,
        goalEn: "Convert a monolithic, tightly-coupled login & profile test into a clean, reusable Page Object Model class in TypeScript with encapsulated locators and async action methods.",
        goalUk: "Перепишіть монолітний тест авторизації та оновлення профілю в чистий клас Page Object Model на TypeScript з інкапсульованими локаторами та методами дій.",
        goalRu: "Преобразуйте монолитный скрипт авторизации и обновления профиля в чистый класс Page Object Model на TypeScript с инкапсулированными локаторами и методами.",
        instructionsEn: [
            "Create a 'ProfilePage' class that encapsulates all profile interaction logic.",
            "Locators must be declared as readonly properties in the constructor or class body using modern Playwright locators.",
            "Expose clear async methods: 'open()', 'updateDisplayName(name: string)', 'expectSuccessToast()'.",
            "Keep test assertions decoupled from the Page Object methods."
        ],
        instructionsUk: [
            "Створіть клас 'ProfilePage', що інкапсулює логіку взаємодії зі сторінкою профілю.",
            "Оголосіть локатори як readonly властивості класу через сучасні селектори Playwright.",
            "Створіть методи дій: 'open()', 'updateDisplayName(name: string)' та 'expectSuccessToast()'.",
            "Збережіть чисте розділення між діями сторінки та фінальними асершнами тесту."
        ],
        instructionsRu: [
            "Создайте класс 'ProfilePage', инкапсулирующий работу с элементами профиля.",
            "Объявите локаторы как readonly свойства с использованием getByRole/getByLabel.",
            "Реализуйте методы 'open()', 'updateDisplayName(name: string)' и проверку сохранения.",
            "Оставьте assertions в теле теста для сохранения переиспользуемости страницы."
        ],
        starterCode: `import { test, expect, Page } from '@playwright/test';

// ❌ MONOLITHIC SCRIPT: Candidate must create a Page Object class
test('Update user profile name', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Direct raw locators scattered inside the test
    await page.locator('input[name="display_name"]').fill('Alex Engineer');
    await page.locator('textarea[name="bio"]').fill('Senior QA Automation Specialist');
    await page.locator('button[type="submit"].save-changes-btn').click();

    // Assertion coupled directly with DOM classes
    const toast = page.locator('.notification-toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Profile updated successfully');
});
`,
        solutionCode: `import { test, expect, Page, Locator } from '@playwright/test';

// ✅ REFACTORED PAGE OBJECT MODEL CLASS
export class ProfilePage {
    readonly page: Page;
    readonly displayNameInput: Locator;
    readonly bioTextarea: Locator;
    readonly saveButton: Locator;
    readonly successToast: Locator;

    constructor(page: Page) {
        this.page = page;
        this.displayNameInput = page.getByLabel(/display name/i);
        this.bioTextarea = page.getByLabel(/bio/i);
        this.saveButton = page.getByRole('button', { name: /save changes/i });
        this.successToast = page.getByRole('status').or(page.locator('.notification-toast-success'));
    }

    async open() {
        await this.page.goto('/settings/profile');
    }

    async updateProfile(displayName: string, bio?: string) {
        await this.displayNameInput.fill(displayName);
        if (bio) await this.bioTextarea.fill(bio);
        await this.saveButton.click();
    }
}

// Clean decoupled test implementation
test('Update user profile name using POM', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.open();
    await profilePage.updateProfile('Alex Engineer', 'Senior QA Automation Specialist');

    await expect(profilePage.successToast).toBeVisible();
    await expect(profilePage.successToast).toContainText('Profile updated successfully');
});
`,
        hintsEn: [
            "Declare 'readonly page: Page' and 'readonly displayNameInput: Locator' inside your class.",
            "Use page.getByLabel('Display Name') for clean accessible form field targeting."
        ],
        hintsUk: [
            "Оголосіть 'readonly page: Page' та типізовані локатори 'readonly displayNameInput: Locator' у конструкторі.",
            "Використовуйте page.getByLabel() для інпутів форми."
        ],
        hintsRu: [
            "Объявите свойства класса с типизацией Locator и инициализируйте их в constructor(page: Page).",
            "Используйте getByLabel для поиска полей формы."
        ]
    },
    {
        id: "challenge-network-mocking",
        titleEn: "Mock Network API & Simulate Payment Failure (500 Error)",
        titleUk: "Мокування API та симуляція збою оплати (500 Server Error)",
        titleRu: "Мокирование API и симуляция сбоя оплаты (500 Server Error)",
        level: "senior",
        category: "Network Interception & Edge Cases",
        timeLimitMinutes: 15,
        goalEn: "Use Playwright's network routing API ('page.route') to intercept an external checkout request, simulate a 500 Internal Server Error, and verify that the application displays a user-friendly error state without crashing.",
        goalUk: "Використайте 'page.route' для перехоплення запиту оплати, симуляції помилки 500 Internal Server Error та перевірки коректного відображення повідомлення про помилку користувачеві.",
        goalRu: "Используйте 'page.route' для перехвата сетевого вызова оплаты, симуляции ошибки 500 Internal Server Error и проверки корректного отображения баннера об ошибке.",
        instructionsEn: [
            "Set up route interception using 'await page.route(\"**/api/v1/checkout/process\", async (route) => { ... })' before triggering the payment.",
            "Fulfill the intercepted route with status code 500 and a JSON payload: '{ error: \"Gateway Timeout / Card declined\" }'.",
            "Trigger the payment by clicking the submit button.",
            "Assert that the error alert is visible and contains informative feedback for the user.",
            "Verify that the submit button returns to an enabled state, allowing the user to retry."
        ],
        instructionsUk: [
            "Налаштуйте перехоплення запиту через 'await page.route(\"**/api/v1/checkout/process\", async (route) => { ... })' перед кліком на оплату.",
            "Поверніть відповідь зі статусом 500 та JSON payload: '{ error: \"Gateway Timeout / Card declined\" }' через 'route.fulfill()'.",
            "Виконайте клік на кнопку підтвердження замовлення.",
            "Перевірте через web-first асершн, що повідомлення про помилку відобразилося на екрані.",
            "Переконайтеся, що кнопка оплати знову активна для повторної спроби."
        ],
        instructionsRu: [
            "Настройте перехват маршрута через 'await page.route(\"**/api/v1/checkout/process\", ...)' до совершения оплаты.",
            "Верните ответ со статусом 500 и телом '{ error: \"Gateway Timeout / Card declined\" }' через 'route.fulfill()'.",
            "Нажмите кнопку подтверждения оплаты.",
            "Убедитесь через web-first expect, что на экране отобразился понятный пользователю алерт ошибки.",
            "Проверьте, что кнопка разблокировалась для повторного нажатия."
        ],
        starterCode: `import { test, expect } from '@playwright/test';

// ❌ INCOMPLETE TEST: Candidate must implement network interception
test('Handle 500 Payment Gateway failure gracefully', async ({ page }) => {
    await page.goto('/checkout/payment');

    // TODO: Intercept '**/api/v1/checkout/process' and mock a 500 Internal Server Error
    // Hint: await page.route(...)

    // Click confirm payment
    await page.getByRole('button', { name: /confirm payment/i }).click();

    // TODO: Verify that error banner appears with message and user can retry
});
`,
        solutionCode: `import { test, expect } from '@playwright/test';

// ✅ ROBUST NETWORK MOCKING SOLUTION
test('Handle 500 Payment Gateway failure gracefully', async ({ page }) => {
    await page.goto('/checkout/payment');

    // 1. Intercept payment endpoint before performing user action
    await page.route('**/api/v1/checkout/process', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
                success: false,
                error: 'Payment gateway timeout. Please try again.'
            })
        });
    });

    // 2. Trigger payment action
    const submitBtn = page.getByRole('button', { name: /confirm payment/i });
    await submitBtn.click();

    // 3. Verify user-friendly error banner appears
    const errorAlert = page.getByRole('alert')
        .or(page.locator('.checkout-error-banner'));
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/payment gateway timeout/i);

    // 4. Verify button returns to enabled state so user can retry
    await expect(submitBtn).toBeEnabled();
});
`,
        hintsEn: [
            "Call route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ... }) }).",
            "Always register 'page.route' BEFORE the user action that triggers the network request."
        ],
        hintsUk: [
            "Викликайте route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ... }) }).",
            "Реєструйте 'page.route' ДО того, як клікнете на кнопку, що надсилає запит."
        ],
        hintsRu: [
            "Используйте route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ... }) }).",
            "Обязательно регистрируйте перехват page.route ДО клика по кнопке оплаты."
        ]
    }
];
