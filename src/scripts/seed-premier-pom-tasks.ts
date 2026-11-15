import { db } from "@/db";
import { projectBoards, projectColumns, projectTasks } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const boardId = 4;
    const targetUrl = "https://www.premieronline.com";

    // 1. Check board
    const [board] = await db.select().from(projectBoards).where(eq(projectBoards.id, boardId));
    if (!board) {
        console.error("Board 4 not found!");
        process.exit(1);
    }
    console.log("Updating board:", board.title);

    // 2. Fetch columns
    const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId));
    const todoCol = columns.find(c => c.order === 1) || columns[0];

    // 3. Delete existing tasks for Board 4 to replace with serious enterprise POM tasks
    await db.delete(projectTasks).where(eq(projectTasks.boardId, boardId));
    console.log("Deleted old tasks for board 4.");

    // 4. Detailed Enterprise Page Object Model Tasks for Premier Online
    const pomTasks = [
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] Архітектура: Створення BasePage та інтеграція Custom Fixtures для Page Objects",
            description: `**Мета завдання:**
Створити фундамент тестового фреймворку для комерційного проєкту \`${targetUrl}\` за патерном **Page Object Model (POM)** з автоматичною ініціалізацією сторінок через **Playwright Custom Fixtures**.

**Вимоги до Page Object Model:**
1. Створити абстрактний або базовий клас \`src/pages/BasePage.ts\`:
   - Конструктор приймає \`protected page: Page\`.
   - Метод \`open(path: string): Promise<void>\` з підтримкою \`baseURL\`.
   - Метод \`waitForPageLoaded(): Promise<void>\` (очікування \`domcontentloaded\` або ключових лейаут-елементів).
   - Глобальний геттер заголовка сторінки та URL.
   - Метод зняття скріншота для звітів \`captureScreenshot(name: string)\`.
2. Створити кастомні фікстури у \`src/fixtures/testFixtures.ts\`:
   - Розширити базовий \`test\` через \`test.extend<{ homePage: HomePage, calendarPage: EventCalendarPage }>\`.
   - Забезпечити передачу інстансів сторінок у тести без ручного створення \`new PageObject(page)\`.

**Критерії прийомки (Acceptance Criteria):**
- Створено \`BasePage.ts\` та \`testFixtures.ts\`.
- Написано smoke-тест у \`tests/smoke/app-init.spec.ts\`, який використовує кастомну фікстуру.
- Відсутній будь-який дубльований код ініціалізації драйвера чи сторінок.`,
            priority: "critical" as const,
            order: 1,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Компонент: HeaderComponent — глобальна навігація, пошук та стан кошика",
            description: `**Мета завдання:**
Реалізувати компонентний Page Object для головного хедера сайту (\`HeaderComponent\`), оскільки він присутній на всіх сторінках платформи.

**Вимоги до Page Object Model:**
1. Створити клас \`src/pages/components/HeaderComponent.ts\`:
   - Локатори (виключно через семантичні методи Playwright):
     - Логотип: \`page.getByRole('link', { name: /premier online/i })\`
     - Меню подій: \`page.getByRole('link', { name: 'Events' })\`
     - Меню результатів: \`page.getByRole('link', { name: 'Results' })\`
     - Кнопка входу: \`page.getByRole('button', { name: /log in|sign in/i })\`
     - Іконка кошика та лічильник товарів: \`page.locator('.header-cart-badge')\`
   - Методи:
     - \`goToEvents(): Promise<EventCalendarPage>\` (повертає екземпляр сторінки календаря)
     - \`goToResults(): Promise<ResultsPage>\`
     - \`openLoginModal(): Promise<LoginModalComponent>\`
     - \`getCartItemCount(): Promise<number>\`
2. Написати E2E тест \`tests/components/header-navigation.spec.ts\`:
   - Перевірка переходів за всіма основними розділами.
   - Перевірка відображення лічильника товарів при додаванні квитків.

**Критерії прийомки:**
- Використано патерн "Component Object" (композиція всередині інших Page Objects).
- Методи переходу повертають відповідні Page Objects (Chained/Fluent API).
- 100% тестів проходять у headless режимі.`,
            priority: "high" as const,
            order: 2,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — динамічний пошук та фільтрація подій за категоріями",
            description: `**Мета завдання:**
Автоматизувати каталог спортивних подій (\`${targetUrl}/event-calendar\`) з використанням Page Object \`EventCalendarPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventCalendarPage.ts\`:
   - Наслідується від \`BasePage\`.
   - Локатори:
     - Чіпси/кнопки категорій (Running, Cycling, Swimming, Triathlon): \`page.getByRole('button', { name: categoryName })\`
     - Список карток подій: \`page.locator('.event-card, [data-testid=\"event-card\"]')\`
     - Заголовки карток: \`page.locator('.event-title')\`
     - Теги виду спорту на картках: \`page.locator('.event-category-badge')\`
   - Методи:
     - \`filterByCategory(category: 'Running' | 'Cycling' | 'Swimming' | 'Triathlon'): Promise<void>\`
     - \`getVisibleEventCardsCount(): Promise<number>\`
     - \`getVisibleEventTitles(): Promise<string[]>\`
     - \`verifyAllEventsHaveCategory(expectedCategory: string): Promise<void>\`
2. Написати тест у \`tests/events/category-filter.spec.ts\`:
   - Вибрати категорію "Running" -> переконатися, що всі показані картки мають тег бігу.
   - Перемкнути на "Cycling" -> перевірити динамічне оновлення карток без повного релоаду сторінки.

**Критерії прийомки:**
- Локатори не прив'язані до ненадійних CSS-класів із хешами.
- Очікування списку реалізовано через веб-ферст асерти (\`expect(locator).toHaveCount()\`).
- Жодних \`page.waitForTimeout()\`.`,
            priority: "high" as const,
            order: 3,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — фільтрація за локацією (Dubai, Abu Dhabi) та датою",
            description: `**Мета завдання:**
Покрити E2E тестами фільтри локацій (Емірати/Міста) та селектор періоду проведення подій.

**Вимоги до Page Object Model:**
1. Розширити \`src/pages/EventCalendarPage.ts\`:
   - Локатори:
     - Дропдаун або список локацій: \`page.getByLabel('Location')\` або \`page.getByRole('combobox', { name: /city|location/i })\`
     - Селектор місяця/діапазону дат: \`page.getByRole('button', { name: /date|month/i })\`
     - Кнопка скидання фільтрів: \`page.getByRole('button', { name: /clear filters|reset/i })\`
   - Методи:
     - \`selectLocation(city: 'Dubai' | 'Abu Dhabi' | 'Sharjah'): Promise<void>\`
     - \`selectMonth(monthYear: string): Promise<void>\`
     - \`resetFilters(): Promise<void>\`
     - \`getEventLocations(): Promise<string[]>\`
2. Написати тест \`tests/events/location-and-date-filter.spec.ts\`:
   - Застосувати фільтр "Dubai" -> перевірити, що всі події відбуваються в Дубаї.
   - Застосувати комбінований фільтр: "Abu Dhabi" + найближчий місяць.
   - Скинути фільтри через кнопку Reset -> перевірити повернення повного списку подій.

**Критерії прийомки:**
- Валідація скидання фільтрів повертає попередню кількість елементів.
- Тест стабільний до можливої затримки відповіді сервера (через вбудовані авто-очікування Playwright).`,
            priority: "medium" as const,
            order: 4,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventCalendarPage — пошуковий рядок та Empty State (порожній результат)",
            description: `**Мета завдання:**
Автоматизувати текстовий пошук подій за ключовими словами та валідацію поведінки при відсутності збігів.

**Вимоги до Page Object Model:**
1. Доповнити \`EventCalendarPage.ts\`:
   - Локатори:
     - Поле пошуку: \`page.getByPlaceholder(/search events/i)\`
     - Повідомлення про відсутність результатів (Empty State): \`page.getByText(/no events found/i)\`
     - Кнопка "Скинути пошук" або хрестик очищення.
   - Методи:
     - \`searchEvent(query: string): Promise<void>\`
     - \`clearSearch(): Promise<void>\`
     - \`isEmptyStateVisible(): Promise<boolean>\`
2. Написати тести у \`tests/events/search-scenarios.spec.ts\`:
   - Позитивний сценарій: Ввести популярне ключове слово (наприклад, "Marathon" або "Run") -> перевірити, що всі знайдені події містять запит у назві або описі.
   - Негативний сценарій: Ввести завідомо неіснуючий запит (\`XYZ999NonExistent\`) -> перевірити відображення повідомлення "No events found matching your criteria" та відсутність карток.

**Критерії прийомки:**
- Використано \`expect(page.getByText(...)).toBeVisible()\`.
- Тест перевіряє поведінку інтерфейсу на пустий результат.`,
            priority: "medium" as const,
            order: 5,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — вибір дистанції (3K/5K/10K/21K) та валідація цін",
            description: `**Мета завдання:**
Створити Page Object для сторінки деталей події (\`EventDetailsPage\`) та протестувати вибір категорії участі і матрицю цін.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/EventDetailsPage.ts\`:
   - Локатори:
     - Назва події: \`page.getByRole('heading', { level: 1 })\`
     - Радіокнопки/картки вибору дистанцій (наприклад, 5KM Fun Run, 10KM, Half Marathon): \`page.locator('.distance-option')\`
     - Блок вартості участі: \`page.locator('.event-price-amount')\`
     - Кнопка реєстрації: \`page.getByRole('button', { name: /register now|enter event/i })\`
   - Методи:
     - \`selectDistance(distanceName: string): Promise<void>\`
     - \`getSelectedDistancePrice(): Promise<{ amount: number, currency: string }>\`
     - \`clickRegister(): Promise<ParticipantStepPage>\` (перехід до форми реєстрації)
2. Написати тест у \`tests/events/event-details-pricing.spec.ts\`:
   - Відкрити сторінку активної події з кількома дистанціями.
   - Вибрати 5K -> перевірити відображення відповідної ціни в AED.
   - Перемкнути на 10K / 21K -> перевірити динамічне оновлення вартості.
   - Натиснути "Register Now" та перевірити відкриття першого кроку реєстрації.

**Критерії прийомки:**
- Коректна обробка числових значень цін (парсинг валюти та суми).
- Перехід на сторінку оформлення повертає відповідний екземпляр Page Object.`,
            priority: "high" as const,
            order: 6,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: EventDetailsPage — статус 'Sold Out' та закриття реєстрації",
            description: `**Мета завдання:**
Автоматизувати перевірку недоступних або розпроданих дистанцій на сторінці події.

**Вимоги до Page Object Model:**
1. Розширити \`EventDetailsPage.ts\`:
   - Локатори:
     - Бейджі "Sold Out" / "Registration Closed": \`page.getByText(/sold out|closed/i)\`
     - Неактивні кнопки вибору дистанцій: \`page.locator('.distance-option.disabled, .distance-option[aria-disabled=\"true\"]')\`
   - Методи:
     - \`isDistanceSoldOut(distanceName: string): Promise<boolean>\`
     - \`verifyRegisterButtonDisabled(): Promise<void>\`
2. Написати тест у \`tests/events/sold-out-handling.spec.ts\`:
   - Перевірити подію або категорію зі статусом "Sold Out":
     - Дистанція має відповідний графічний статус.
     - Клік по такій категорії не дозволяє вибрати її для реєстрації.
     - Кнопка "Register Now" є вимкненою (\`toBeDisabled()\`) або веде до списку очікування (Waitlist).

**Критерії прийомки:**
- Використано асерти Playwright \`expect(locator).toBeDisabled()\` або \`toHaveAttribute('aria-disabled', 'true')\`.`,
            priority: "low" as const,
            order: 7,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: LoginPage — інкапсуляція форми входу Premier ID та валідація помилок",
            description: `**Мета завдання:**
Створити Page Object для форми авторизації \`LoginPage\` та протестувати всі негативні сценарії валідації.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/LoginPage.ts\`:
   - Локатори:
     - Email: \`page.getByLabel(/email|premier id/i)\`
     - Password: \`page.getByLabel(/password/i)\`
     - Кнопка входу: \`page.getByRole('button', { name: /sign in|log in/i })\`
     - Повідомлення про помилки: \`page.locator('.error-message, [role=\"alert\"]')\`
     - Посилання "Forgot Password": \`page.getByRole('link', { name: /forgot password/i })\`
   - Методи:
     - \`login(email: string, pass: string): Promise<void>\`
     - \`getValidationErrorMessage(): Promise<string>\`
     - \`clickForgotPassword(): Promise<ForgotPasswordModal>\`
2. Написати тест у \`tests/auth/login-validation.spec.ts\`:
   - Сценарій 1: Сабміт пустої форми -> перевірка повідомлень про обов'язкові поля.
   - Сценарій 2: Невалідний формат email (наприклад \`testuser.com\`) -> клієнтська валідація.
   - Сценарій 3: Невірні облікові дані -> отримання бекенд-помилки "Invalid email or password".

**Критерії прийомки:**
- Паролі та чутливі дані не хардкодяться в тестах.
- Всі локатори інкапсульовані всередині \`LoginPage\`.`,
            priority: "critical" as const,
            order: 8,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Setup: Глобальна сесія через StorageState та флоу відновлення пароля",
            description: `**Мета завдання:**
Налаштувати збереження стану авторизованого користувача через **Playwright StorageState**, щоб не проходити логін у кожному тесті, а також протестувати запит на відновлення пароля.

**Вимоги до реалізації:**
1. Створити setup-проєкт у \`playwright.config.ts\`:
   - Створити \`tests/auth.setup.ts\`:
     - Авторизується під тестовим користувачем через \`LoginPage\`.
     - Зберігає cookies та local storage у файл \`playwright/.auth/user.json\`.
2. Налаштувати тестові проекти:
   - Проект "authenticated" автоматично використовує \`storageState: 'playwright/.auth/user.json'\`.
3. Додати в \`LoginPage.ts\` метод \`requestPasswordReset(email: string): Promise<void>\`.
4. Написати тест відновлення пароля \`tests/auth/password-recovery.spec.ts\`:
   - Ввести валідний email -> перевірити появу нотифікації "Password reset instructions sent to your email".

**Критерії прийомки:**
- Авторизовані тести стартують вже залогіненими (економія до 80% часу виконання сьюти).
- Файл \`playwright/.auth/user.json\` додано в \`.gitignore\`.`,
            priority: "high" as const,
            order: 9,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ParticipantStepPage — крок 1: персональні дані та екстрений контакт",
            description: `**Мета завдання:**
Створити Page Object для першого кроку реєстрації на змагання (\`ParticipantStepPage\`) та протестувати заповнення форми учасника.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/ParticipantStepPage.ts\`:
   - Локатори:
     - Ім'я та прізвище: \`page.getByLabel('First Name')\`, \`page.getByLabel('Last Name')\`
     - Стать (Gender): \`page.getByRole('radio', { name: /male|female/i })\`
     - Дата народження (DOB): дейтпікер або випадаючі списки дня/місяця/року.
     - Національність: \`page.getByLabel(/nationality|country/i)\`
     - Екстрений контакт (ПІБ та телефон): \`page.getByLabel(/emergency contact name/i)\`, \`page.getByLabel(/emergency contact phone/i)\`
     - Кнопка переходу далі: \`page.getByRole('button', { name: /continue|next/i })\`
   - Методи:
     - \`fillParticipantDetails(data: ParticipantData): Promise<void>\`
     - \`fillEmergencyContact(name: string, phone: string): Promise<void>\`
     - \`proceedToNextStep(): Promise<WaiverStepPage>\`
2. Написати тест у \`tests/registration/participant-step.spec.ts\`:
   - Заповнити крок згенерованими даними (наприклад, через Faker або підготовлені тестові об'єкти).
   - Перевірити валідацію обов'язковості номера екстреного зв'язку.
   - Успішно перейти до наступного кроку.

**Критерії прийомки:**
- Дані типізовані за допомогою TypeScript interface \`ParticipantData\`.
- Реалізовано перевірку обов'язкових полів.`,
            priority: "critical" as const,
            order: 10,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: WaiverStepPage — крок 2: медичний вейвер, згода з правилами та розмір форми",
            description: `**Мета завдання:**
Створити Page Object \`WaiverStepPage\` для перевірки медичного застереження (Waiver), правил безпеки та вибору додаткових опцій учасника (розмір футболки).

**Вимоги до Page Object Model:**
1. Створити \`src/pages/registration/WaiverStepPage.ts\`:
   - Локатори:
     - Селектор розміру футболки: \`page.getByLabel(/t-shirt size|merchandise/i)\`
     - Чекбокс медичного застереження: \`page.getByRole('checkbox', { name: /medical disclaimer|waiver/i })\`
     - Чекбокс згоди з правилами заходу: \`page.getByRole('checkbox', { name: /terms & conditions/i })\`
     - Кнопка переходу до кошика/оплати: \`page.getByRole('button', { name: /proceed to checkout|confirm/i })\`
     - Алерт/попередження про неприйнятий вейвер: \`page.locator('.waiver-error')\`
   - Методи:
     - \`selectTShirtSize(size: 'S' | 'M' | 'L' | 'XL' | 'XXL'): Promise<void>\`
     - \`acceptMedicalWaiver(): Promise<void>\`
     - \`acceptTermsAndConditions(): Promise<void>\`
     - \`proceedToCheckout(): Promise<CheckoutPage>\`
2. Написати тест у \`tests/registration/waiver-and-merch.spec.ts\`:
   - Сценарій 1 (Негативний): Спроба натиснути "Proceed" без чекбокса вейверу -> перевірити блокування або повідомлення про необхідність згоди.
   - Сценарій 2 (Позитивний): Вибрати розмір 'L', відзначити обидва чекбокси -> перейти на сторінку чекауту.

**Критерії прийомки:**
- Чітке розділення кроків форми на окремі Page Objects.
- Метод \`proceedToCheckout()\` повертає ініціалізований \`CheckoutPage\`.`,
            priority: "high" as const,
            order: 11,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: CheckoutPage — розрахунок підсумку (VAT, збори) та застосування промокоду",
            description: `**Мета завдання:**
Створити Page Object \`CheckoutPage\` для перевірки калькуляції суми замовлення, нарахування ПДВ/зборів та роботи з промокодами/ваучерами.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/CheckoutPage.ts\`:
   - Локатори:
     - Базова вартість (Subtotal): \`page.locator('[data-testid=\"subtotal-amount\"]')\`
     - Сервісний збір / VAT (5% ОАЕ): \`page.locator('[data-testid=\"vat-amount\"]')\`
     - Загальна сума (Total): \`page.locator('[data-testid=\"total-amount\"]')\`
     - Поле введення промокоду: \`page.getByPlaceholder(/promo code|voucher/i)\`
     - Кнопка застосування коду: \`page.getByRole('button', { name: /apply/i })\`
     - Повідомлення про статус промокоду: \`page.locator('.promo-feedback')\`
   - Методи:
     - \`getOrderSummary(): Promise<{ subtotal: number, vat: number, fee: number, total: number }>\`
     - \`applyPromoCode(code: string): Promise<void>\`
     - \`getPromoMessage(): Promise<string>\`
2. Написати тести у \`tests/checkout/order-summary.spec.ts\`:
   - Перевірити математичну коректність підсумку: \`Total = Subtotal + VAT + ServiceFee\`.
   - Ввести недійсний промокод \`DISCOUNT_999\` -> отримати повідомлення "Invalid or expired promo code" та переконатися, що підсумок не змінився.
   - Ввести валідний промокод (або змокований) -> перевірити перерахунок \`Total\`.

**Критерії прийомки:**
- Тест перевіряє фінансову точність (округлення до 2 знаків після коми).
- Жодних флаків при асинхронному перерахунку сум.`,
            priority: "high" as const,
            order: 12,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування платіжного шлюзу через page.route — обробка відмов банку",
            description: `**Мета завдання:**
Забезпечити безпечне та стабільне тестування оплати без реального списання коштів за допомогою перехоплення мережевих запитів (\`page.route\`).

**Вимоги до реалізації:**
1. Створити сервісний клас/хелпер \`src/utils/PaymentMockHelper.ts\`:
   - Метод \`mockDeclinedCard(page: Page, reason: string): Promise<void>\`:
     - Перехоплює POST запити до платіжного шлюзу (наприклад \`**/api/payment/process\` або ендпоінт еквайрингу).
     - Повертає статус 400/402 з JSON-тілом: \`{ success: false, error: 'Card declined: Insufficient funds' }\`.
   - Метод \`mockNetworkTimeout(page: Page): Promise<void>\`:
     - Емулює збій зв'язку або таймаут 504 Gateway Timeout.
2. Написати E2E тести у \`tests/checkout/payment-mocking.spec.ts\`:
   - Сценарій 1 (Відхилена карта): Натиснути "Pay Now" з активованим моком відмови -> перевірити появу червоного алерта для користувача: "Платіж відхилено банком". Переконатися, що замовлення не скинулося і користувач може спробувати знову.
   - Сценарій 2 (Таймаут): Перевірити появу кнопки повторної спроби без подвійного створення квитка.

**Критерії прийомки:**
- Тести повністю ізольовані від реальних платіжних систем.
- Перевірено UX реакцію інтерфейсу на помилки еквайрингу.`,
            priority: "critical" as const,
            order: 13,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Network: Мокування успішної оплати та верифікація сторінки підтвердження",
            description: `**Мета завдання:**
Змокувати успішну відповідь платіжного шлюзу та протестувати генерацію замовлення на сторінці підтвердження \`OrderConfirmationPage\`.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/OrderConfirmationPage.ts\`:
   - Локатори:
     - Заголовок успіху: \`page.getByRole('heading', { name: /thank you|registration confirmed/i })\`
     - Номер замовлення (Booking Reference / Order ID): \`page.locator('[data-testid=\"order-id\"]')\`
     - Деталі зареєстрованого учасника та дистанція: \`page.locator('.order-details')\`
     - Кнопка переходу до кабінету ("Go to My Events"): \`page.getByRole('link', { name: /my events|view tickets/i })\`
   - Методи:
     - \`getOrderId(): Promise<string>\`
     - \`goToMyEvents(): Promise<MyEventsPage>\`
2. Доповнити \`PaymentMockHelper.ts\` методом \`mockSuccessfulPayment(page: Page, orderId: string)\`.
3. Написати тест у \`tests/checkout/successful-order.spec.ts\`:
   - Пройти повний шлях чекауту з моком успішної оплати.
   - Перевірити редирект на \`OrderConfirmationPage\`.
   - Перевірити наявність валідного ідентифікатора замовлення та правильність суми.

**Критерії прийомки:**
- Повний end-to-end флоу від кошика до підтвердження без реальних витрат.
- Валідація коректності відображення всіх параметрів замовлення.`,
            priority: "high" as const,
            order: 14,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: MyEventsPage — кабінет учасника, стартовий номер та завантаження PDF квитка",
            description: `**Мета завдання:**
Створити Page Object для особистого кабінету учасника \`MyEventsPage\` та автоматизувати перевірку куплених квитків та завантаження файлів (Download).

**Вимоги до Page Object Model:**
1. Створити \`src/pages/MyEventsPage.ts\`:
   - Локатори:
     - Вкладки подій (Upcoming / Past Events): \`page.getByRole('tab', { name: /upcoming/i })\`
     - Картки зареєстрованих подій: \`page.locator('.registered-event-card')\`
     - Стартовий номер (Bib Number): \`page.locator('.bib-number')\`
     - QR-код для чек-іну: \`page.locator('img.checkin-qr-code')\`
     - Кнопка завантаження квитанції/квитка: \`page.getByRole('button', { name: /download ticket|invoice/i })\`
   - Методи:
     - \`getUpcomingEventsCount(): Promise<number>\`
     - \`getEventBibNumber(eventTitle: string): Promise<string>\`
     - \`downloadTicket(eventTitle: string): Promise<Download>\`
2. Написати тест у \`tests/cabinet/tickets-and-downloads.spec.ts\`:
   - Використати авторизований стан (\`storageState\`).
   - Відкрити кабінет -> перевірити відображення зареєстрованої події у списку майбутніх.
   - Виконати завантаження PDF квитка за допомогою \`page.waitForEvent('download')\`:
     - Перевірити, що ім'я завантаженого файлу закінчується на \`.pdf\`.
     - Зберегти тимчасовий файл та перевірити, що його розмір > 0 байт.

**Критерії прийомки:**
- Асинхронне перехоплення події завантаження без збоїв.
- Перевірка наявності стартового номера та QR-коду.`,
            priority: "high" as const,
            order: 15,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM E2E: ResultsPage — пошук офіційних результатів забігу за номером або атлетом",
            description: `**Мета завдання:**
Створити Page Object для сторінки спортивних результатів (\`ResultsPage\`) та протестувати пошук протоколів забігів.

**Вимоги до Page Object Model:**
1. Створити \`src/pages/ResultsPage.ts\`:
   - Локатори:
     - Селектор року та змагання: \`page.getByRole('combobox', { name: /event/i })\`
     - Поле пошуку за Bib / Прізвищем: \`page.getByPlaceholder(/bib or athlete name/i)\`
     - Таблиця результатів: \`page.locator('table.results-table')\`
     - Рядки результатів: \`page.locator('table.results-table tbody tr')\`
   - Методи:
     - \`selectEvent(eventName: string): Promise<void>\`
     - \`searchParticipant(query: string): Promise<void>\`
     - \`getFirstResultRow(): Promise<{ rank: string, name: string, chipTime: string, category: string }>\`
2. Написати тест у \`tests/results/race-results-search.spec.ts\`:
   - Відкрити \`${targetUrl}/results\`.
   - Вибрати нещодавній марафон.
   - Ввести ім'я або стартовий номер відомого учасника.
   - Перевірити, що в таблиці відображаються коректний ранг (Rank), Chip Time та категорія віку.

**Критерії прийомки:**
- Парсинг HTML-таблиці реалізовано в окремому хелпері або методі POM.
- Верифікація формату часу (наприклад, \`00:45:12\`).`,
            priority: "medium" as const,
            order: 16,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM API: ApiEventsClient — валідація REST контрактів подій (/api/events)",
            description: `**Мета завдання:**
Створити API Client для валідації бекенд-ендпоінтів платформи за допомогою Playwright \`request\` (APIRequestContext).

**Вимоги до реалізації:**
1. Створити \`src/api/ApiEventsClient.ts\`:
   - Конструктор приймає \`APIRequestContext\`.
   - Метод \`getEvents(params?: { category?: string, limit?: number }): Promise<APIResponse>\`.
   - Метод \`getEventDetails(eventIdOrSlug: string): Promise<APIResponse>\`.
2. Написати тести у \`tests/api/events-contract.spec.ts\`:
   - Перевірити статус відповіді: \`expect(response.status()).toBe(200)\`.
   - Перевірити час відповіді: час виконання запиту не перевищує 1200ms.
   - Валідувати схему JSON-відповіді:
     - Кожен об'єкт містить обов'язкові поля: \`id\` (number/string), \`title\` (string), \`date_start\` (ISO date), \`location\` (string), \`categories\` (array).
   - Порівняти дані: переконатися, що події, повернуті по API, відповідають тим, які рендерить \`EventCalendarPage\`.

**Критерії прийомки:**
- Використано типізовані DTO інтерфейси TypeScript (\`EventDto\`).
- Повне покриття API контрактів без запуску браузера (швидкі тести).`,
            priority: "medium" as const,
            order: 17,
        },
        {
            boardId,
            columnId: todoCol.id,
            title: "[TypeScript] POM Mobile & Visual: Адаптивність, бургер-меню та регресійні знімки (toHaveScreenshot)",
            description: `**Мета завдання:**
Покрити платформу тестами мобільної адаптивності та візуальними регресійними перевірками за патерном Page Object.

**Вимоги до реалізації:**
1. Створити \`src/pages/mobile/MobileNavigationComponent.ts\`:
   - Локатори для мобільного бургер-меню: \`page.getByRole('button', { name: /toggle navigation|menu/i })\`
   - Сайдбар навігації: \`page.locator('.mobile-drawer, .nav-drawer')\`
   - Методи: \`openMenu()\`, \`closeMenu()\`, \`isMenuOpen()\`.
2. Налаштувати мобільні пристрої у \`playwright.config.ts\` (наприклад, \`devices['iPhone 14']\` або \`devices['Pixel 7']\`).
3. Написати тести у \`tests/mobile/mobile-layout.spec.ts\`:
   - Перевірити роботу бургер-меню на мобільному в'юпорті.
   - Перевірити відсутність горизонтального скролу сторінки (\`scrollWidth <= clientWidth\`).
4. Написати візуальний тест у \`tests/visual/home-visual.spec.ts\`:
   - Дочекатися завантаження шрифтів \`document.fonts.ready\`.
   - Приховати динамічні промо-банери через опцію \`mask: [page.locator('.hero-carousel, .countdown-timer')]\`.
   - Виконати перевірку \`await expect(page).toHaveScreenshot('home-screen.png', { maxDiffPixelRatio: 0.05 })\`.

**Критерії прийомки:**
- Маскування всіх динамічних/анімованих областей для усунення флаків.
- Перевірка мобільного та десктопного лейауту.`,
            priority: "low" as const,
            order: 18,
        },
    ];

    await db.insert(projectTasks).values(pomTasks);
    console.log(`Successfully seeded ${pomTasks.length} enterprise POM tasks for Premier Online!`);
    process.exit(0);
}

main().catch(err => {
    console.error("Error seeding tasks:", err);
    process.exit(1);
});
