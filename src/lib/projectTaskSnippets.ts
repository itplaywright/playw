export interface TaskHelperData {
    language: "typescript" | "python" | "csharp" | "yaml";
    category: string;
    starterCode: string;
    acceptanceCriteria: string[];
    acceptanceCriteriaRu?: string[];
    acceptanceCriteriaEn?: string[];
    tips: string[];
    tipsRu?: string[];
    tipsEn?: string[];
}

export const TASK_SNIPPETS: Record<string, TaskHelperData> = {
    // 1. Auth & Form Validation
    "auth": {
        language: "typescript",
        category: "TypeScript • E2E Testing",
        starterCode: `import { test, expect } from '@playwright/test';

test.describe('Authentication & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should validate empty inputs on submit', async ({ page }) => {
    // Click submit without entering credentials
    await page.click('button[type="submit"]');
    
    // Validate required field alerts
    await expect(page.locator('text=Email обов\\'язковий')).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong.student@example.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Невірний email або пароль')).toBeVisible();
  });

  test('should redirect to dashboard upon successful login', async ({ page }) => {
    await page.fill('input[type="email"]', process.env.STUDENT_EMAIL || 'student@example.com');
    await page.fill('input[type="password"]', process.env.STUDENT_PASS || 'Secret123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Рівень');
  });
});`,
        acceptanceCriteria: [
            "Тест перевіряє поведінку форми при порожніх полях",
            "Тест перевіряє виведення помилки при невірному паролі/email",
            "Успішний вхід перевіряє редирект на /dashboard та наявність сесії",
            "Усі селектори використовують data-testid або семантичні локатори (getByRole, getByLabel)"
        ],
        acceptanceCriteriaRu: [
            "Тест проверяет поведение формы при пустых полях",
            "Тест проверяет вывод ошибки при неверном пароле/email",
            "Успешный вход проверяет редирект на /dashboard и наличие сессии",
            "Все селекторы используют data-testid или семантические локаторы (getByRole, getByLabel)"
        ],
        acceptanceCriteriaEn: [
            "Test validates form behavior on empty inputs",
            "Test validates error alert on invalid email or password",
            "Successful login validates redirect to /dashboard and active session",
            "All selectors use data-testid or semantic locators (getByRole, getByLabel)"
        ],
        tips: [
            "Використовуйте `page.waitForURL('**/dashboard')` замість статичних таймаутів",
            "Зберігайте паролі у файлі `.env` або через Test Fixtures",
            "Для скидання стану сесії запускайте тести в ізольованому браузерному контексті"
        ],
        tipsRu: [
            "Используйте `page.waitForURL('**/dashboard')` вместо статических таймаутов",
            "Храните пароли в файле `.env` или через Test Fixtures",
            "Для сброса состояния сессии запускайте тесты в изолированном браузерном контексте"
        ],
        tipsEn: [
            "Use `page.waitForURL('**/dashboard')` instead of static timeouts",
            "Store credentials in `.env` file or via Test Fixtures",
            "Run tests in an isolated browser context to reset session state"
        ]
    },

    // 2. POM Cabinet
    "pom": {
        language: "typescript",
        category: "TypeScript • Page Object Model",
        starterCode: `import { Page, Locator, expect } from '@playwright/test';

export class CabinetPage {
  readonly page: Page;
  readonly tabOverview: Locator;
  readonly tabCertificates: Locator;
  readonly tabSettings: Locator;
  readonly certScaleRoadmap: Locator;
  readonly saveProfileBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabOverview = page.getByRole('button', { name: /Огляд|Overview/i });
    this.tabCertificates = page.getByRole('button', { name: /Сертифікати|Certificates/i });
    this.tabSettings = page.getByRole('button', { name: /Налаштування|Settings/i });
    this.certScaleRoadmap = page.locator('text=Шкала кваліфікації та сертифікації');
    this.saveProfileBtn = page.locator('#save-profile-btn');
  }

  async goto(tab?: 'overview' | 'certificates' | 'profile') {
    const url = tab ? \`/cabinet?tab=\${tab}\` : '/cabinet';
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectTab(tab: 'overview' | 'certificates' | 'profile') {
    if (tab === 'certificates') await this.tabCertificates.click();
    else if (tab === 'profile') await this.tabSettings.click();
    else await this.tabOverview.click();
  }

  async verifyCertScaleVisible() {
    await expect(this.certScaleRoadmap).toBeVisible();
    await expect(this.page.locator('text=Playwright Associate')).toBeVisible();
    await expect(this.page.locator('text=Automation Specialist')).toBeVisible();
    await expect(this.page.locator('text=Lead Architect')).toBeVisible();
  }
}`,
        acceptanceCriteria: [
            "Клас CabinetPage містить локатори для всіх 4 вкладок",
            "Метод `goto(tab)` підтримує прямі query-параметри",
            "Метод `selectTab(tab)` перемикає вкладки та оновлює стан",
            "Наявний асершн для перевірки наявності 3-рівневої шкали сертифікації"
        ],
        acceptanceCriteriaRu: [
            "Класс CabinetPage содержит локаторы для всех 4 вкладок",
            "Метод `goto(tab)` поддерживает прямые query-параметры",
            "Метод `selectTab(tab)` переключает вкладки и обновляет состояние",
            "Имеется assertion для проверки наличия 3-уровневой шкалы сертификации"
        ],
        acceptanceCriteriaEn: [
            "CabinetPage class contains locators for all 4 tabs",
            "Method `goto(tab)` supports direct query parameters",
            "Method `selectTab(tab)` switches tabs and updates state",
            "Assertion present to verify 3-level certification scale visibility"
        ],
        tips: [
            "Використовуйте регулярні вирази в getByRole для підтримки мультимовності (UK/EN/RU)",
            "Не робіть викликів `page.waitForTimeout()` — покладайтесь на авто-очікування Playwright"
        ],
        tipsRu: [
            "Используйте регулярные выражения в getByRole для поддержки мультиязычности (UK/EN/RU)",
            "Не используйте `page.waitForTimeout()` — полагайтесь на авто-ожидание Playwright"
        ],
        tipsEn: [
            "Use regex patterns in getByRole to support multilingual UI (UK/EN/RU)",
            "Avoid `page.waitForTimeout()` calls — rely on Playwright's auto-waiting"
        ]
    },

    // 3. Certificate Verify
    "verify": {
        language: "typescript",
        category: "TypeScript • Verification & External Links",
        starterCode: `import { test, expect } from '@playwright/test';

test.describe('Certificate Verification Page', () => {
  test('should render sample certificate with tier and LinkedIn share', async ({ page }) => {
    await page.goto('/verify/sample');

    // 1. Verify Title & Tier
    await expect(page.locator('h1')).toContainText('Сертифікат');
    await expect(page.locator('text=Playwright Associate')).toBeVisible();

    // 2. Copy Link Button
    const copyBtn = page.getByRole('button', { name: /Копіювати посилання|Copy Link/i });
    await expect(copyBtn).toBeVisible();

    // 3. LinkedIn Link with Query Parameters
    const linkedInLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedInLink).toBeVisible();
    
    const href = await linkedInLink.getAttribute('href');
    expect(href).toContain('linkedin.com/profile/add');
    expect(href).toContain('Playwright');
  });
});`,
        acceptanceCriteria: [
            "Перевірка відкриття `/verify/sample` без помилок 404/500",
            "Валідація ступеня (Associate/Specialist/Architect)",
            "Перевірка атрибутів кнопки LinkedIn (правильні query params)"
        ],
        acceptanceCriteriaRu: [
            "Проверка открытия `/verify/sample` без ошибок 404/500",
            "Валидация степени (Associate/Specialist/Architect)",
            "Проверка атрибутов кнопки LinkedIn (правильные query params)"
        ],
        acceptanceCriteriaEn: [
            "Verify `/verify/sample` opens without 404/500 errors",
            "Validate tier level (Associate/Specialist/Architect)",
            "Verify LinkedIn button attributes (correct query params)"
        ],
        tips: [
            "Використовуйте `expect(href).toContain(...)` для перевірки динамічних посилань"
        ],
        tipsRu: [
            "Используйте `expect(href).toContain(...)` для проверки динамических ссылок"
        ],
        tipsEn: [
            "Use `expect(href).toContain(...)` to verify dynamic link attributes"
        ]
    },

    // 4. Python API Certificates
    "python-api": {
        language: "python",
        category: "Python • PyTest & APIRequestContext",
        starterCode: `import pytest
from playwright.sync_api import sync_playwright

BASE_URL = "https://itplatform-three.vercel.app"

def test_unauthorized_certificates_access():
    with sync_playwright() as p:
        request_context = p.request.new_context(base_url=BASE_URL)
        response = request_context.get("/api/user/certificates")
        # Without session cookie, endpoint should be protected
        assert response.status in [401, 403, 307]

def test_authorized_certificates_response_schema():
    with sync_playwright() as p:
        # Pass valid session cookie or mock header
        request_context = p.request.new_context(
            base_url=BASE_URL,
            extra_http_headers={"Cookie": "authjs.session-token=YOUR_TOKEN"}
        )
        response = request_context.get("/api/user/certificates")
        if response.status == 200:
            data = response.json()
            assert "certificates" in data
            assert isinstance(data["certificates"], list)
            for cert in data["certificates"]:
                assert "tier" in cert
                assert "completedTasks" in cert
                assert "percentage" in cert`,
        acceptanceCriteria: [
            "Перевірка статусу відповіді без авторизації (401/403/Redirect)",
            "Перевірка структури JSON-відповіді з авторизацією",
            "Валідація полів: tier.id, totalTasks, percentage, isUnlocked"
        ],
        acceptanceCriteriaRu: [
            "Проверка статуса ответа без авторизации (401/403/Redirect)",
            "Проверка структуры JSON-ответа с авторизацией",
            "Валидация полей: tier.id, totalTasks, percentage, isUnlocked"
        ],
        acceptanceCriteriaEn: [
            "Verify response status without authorization (401/403/Redirect)",
            "Verify JSON response structure with authorization",
            "Validate fields: tier.id, totalTasks, percentage, isUnlocked"
        ],
        tips: [
            "Запускайте за допомогою `pytest -v tests/test_api_certs.py`",
            "Використовуйте pytest fixtures для підготовки авторизованого контексту"
        ],
        tipsRu: [
            "Запускайте с помощью `pytest -v tests/test_api_certs.py`",
            "Используйте pytest fixtures для подготовки авторизованного контекста"
        ],
        tipsEn: [
            "Run with `pytest -v tests/test_api_certs.py`",
            "Use pytest fixtures to prepare an authorized request context"
        ]
    },

    // 5. Python Profile API
    "python-profile": {
        language: "python",
        category: "Python • PyTest & Data Mutation",
        starterCode: `import pytest
from playwright.sync_api import sync_playwright

def test_update_user_profile(authenticated_request_context):
    payload = {
        "firstName": "Олександр",
        "lastName": "QA Інженер",
        "phone": "+380509998877",
        "telegram": "@qa_student",
        "whatsapp": "+380509998877"
    }
    
    response = authenticated_request_context.patch("/api/user/profile", data=payload)
    assert response.status == 200
    
    # Verify changes reflected
    get_res = authenticated_request_context.get("/api/user/profile")
    assert get_res.status == 200
    profile = get_res.json()
    assert profile["firstName"] == "Олександр"
    assert profile["phone"] == "+380509998877"`,
        acceptanceCriteria: [
            "Перевірка PATCH-запиту на `/api/user/profile`",
            "Перевірка збереження контактів",
            "Валідація некоректного формату даних"
        ],
        acceptanceCriteriaRu: [
            "Проверка PATCH-запроса на `/api/user/profile`",
            "Проверка сохранения контактов",
            "Валидация некорректного формата данных"
        ],
        acceptanceCriteriaEn: [
            "Verify PATCH request to `/api/user/profile`",
            "Verify contacts are saved correctly",
            "Validate error handling for incorrect data format"
        ],
        tips: [
            "Перевіряйте зміну даних повторним GET-запитом (Idempotency / Verification)"
        ],
        tipsRu: [
            "Проверяйте изменение данных повторным GET-запросом (Idempotency / Verification)"
        ],
        tipsEn: [
            "Verify data changes with a follow-up GET request (Idempotency / Verification)"
        ]
    },

    // 6. C# Simulator
    "csharp": {
        language: "csharp",
        category: "C# / .NET • NUnit & Code Simulator",
        starterCode: `using System.Threading.Tasks;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace PlaywrightTests
{
    [Parallelizable(ParallelScope.Self)]
    [TestFixture]
    public class TaskEditorTests : PageTest
    {
        [Test]
        public async Task TestRunSimulatorInEditor()
        {
            await Page.GotoAsync("/tasks/1");

            // 1. Locate editor or click to focus
            var editor = Page.Locator(".monaco-editor, textarea").First;
            await Expect(editor).ToBeVisibleAsync();

            // 2. Type test Playwright script
            await editor.ClickAsync();
            await Page.Keyboard.TypeAsync("await page.goto('https://example.com');");

            // 3. Trigger execution (Ctrl+Enter or Run Button)
            var runButton = Page.GetByRole(AriaRole.Button, new() { NameString = "Запустити тест" });
            if (await runButton.IsVisibleAsync())
            {
                await runButton.ClickAsync();
            }
            else
            {
                await Page.Keyboard.PressAsync("Control+Enter");
            }

            // 4. Verify terminal output
            var terminal = Page.Locator(".terminal-output, [data-testid='test-output']");
            await Expect(terminal).ToBeVisibleAsync();
        }
    }
}`,
        acceptanceCriteria: [
            "Проєкт зібрано на .NET 8 / C# з пакетом Microsoft.Playwright.NUnit",
            "Тест відкриває сторінку завдання `/tasks/1`",
            "Введення коду в редактор та запуск симуляції",
            "Перевірка появи результату в терміналі"
        ],
        acceptanceCriteriaRu: [
            "Проект собран на .NET 8 / C# с пакетом Microsoft.Playwright.NUnit",
            "Тест открывает страницу задания `/tasks/1`",
            "Ввод кода в редактор и запуск симуляции",
            "Проверка появления результата в терминале"
        ],
        acceptanceCriteriaEn: [
            "Project built on .NET 8 / C# with Microsoft.Playwright.NUnit package",
            "Test opens task page `/tasks/1`",
            "Code entered into editor and simulation launched",
            "Terminal output verified after execution"
        ],
        tips: [
            "Використовуйте `dotnet test` для запуску тестів",
            "Завантажте браузери через `pwsh bin/Debug/net8.0/playwright.ps1 install`"
        ],
        tipsRu: [
            "Используйте `dotnet test` для запуска тестов",
            "Загрузите браузеры через `pwsh bin/Debug/net8.0/playwright.ps1 install`"
        ],
        tipsEn: [
            "Use `dotnet test` to run your tests",
            "Install browsers via `pwsh bin/Debug/net8.0/playwright.ps1 install`"
        ]
    },

    // 7. Network Interception
    "network": {
        language: "typescript",
        category: "TypeScript • page.route & Mocking",
        starterCode: `import { test, expect } from '@playwright/test';

test.describe('Network Interception & Mentor Notifications', () => {
  test('should mock mentor review approval banner', async ({ page }) => {
    // 1. Intercept notifications endpoint
    await page.route('**/api/user/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 999,
            status: 'reviewed',
            title: 'Завдання схвалено!',
            mentorComment: 'Чудова архітектура! Завдання зараховано ментором.',
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // 2. Navigate to dashboard
    await page.goto('/dashboard');

    // 3. Verify notification alert appears
    const notificationBanner = page.locator('text=Чудова архітектура! Завдання зараховано ментором.');
    await expect(notificationBanner).toBeVisible({ timeout: 10000 });
  });
});`,
        acceptanceCriteria: [
            "Використання `page.route` для перехоплення HTTP-запиту",
            "Мокування відповіді зі статусом 'reviewed' та коментарем ментора",
            "Перевірка відображення глобального сповіщення на клієнті"
        ],
        acceptanceCriteriaRu: [
            "Использование `page.route` для перехвата HTTP-запроса",
            "Мокирование ответа со статусом 'reviewed' и комментарием ментора",
            "Проверка отображения глобального уведомления на клиенте"
        ],
        acceptanceCriteriaEn: [
            "Use `page.route` to intercept HTTP requests",
            "Mock response with 'reviewed' status and mentor comment",
            "Verify global notification banner appears on the client"
        ],
        tips: [
            "Встановлюйте route до виклику `page.goto()`",
            "Можна мокувати як успішні (200), так і помилкові відповіді (500) для перевірки стійкості UI"
        ],
        tipsRu: [
            "Устанавливайте route до вызова `page.goto()`",
            "Можно мокировать как успешные (200), так и ошибочные ответы (500) для проверки устойчивости UI"
        ],
        tipsEn: [
            "Set up route before calling `page.goto()`",
            "Mock both success (200) and error (500) responses to verify UI resilience"
        ]
    },

    // 8. Mobile & Cross-Browser
    "mobile": {
        language: "typescript",
        category: "Cross-Browser • Mobile Emulation",
        starterCode: `import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Viewport & Navigation', () => {
  test.use({ ...devices['iPhone 14 Pro'] });

  test('should collapse desktop menu and open mobile hamburger drawer', async ({ page }) => {
    await page.goto('/');

    // 1. Desktop links should be hidden
    await expect(page.locator('nav.hidden.md\\\\:flex')).not.toBeVisible();

    // 2. Hamburger button should be visible
    const hamburgerBtn = page.getByRole('button', { name: /меню|menu/i }).first();
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    // 3. Mobile links should now be visible
    await expect(page.getByRole('link', { name: /Вхід|Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Реєстрація|Register/i })).toBeVisible();
  });
});`,
        acceptanceCriteria: [
            "Емуляція `devices['iPhone 14 Pro']` або `devices['Pixel 7']`",
            "Перевірка приховування десктопного меню",
            "Перевірка відкриття мобільного меню та клікабельності посилань"
        ],
        acceptanceCriteriaRu: [
            "Эмуляция `devices['iPhone 14 Pro']` или `devices['Pixel 7']`",
            "Проверка скрытия десктопного меню",
            "Проверка открытия мобильного меню и кликабельности ссылок"
        ],
        acceptanceCriteriaEn: [
            "Emulate `devices['iPhone 14 Pro']` or `devices['Pixel 7']`",
            "Verify desktop menu is hidden on mobile viewport",
            "Verify mobile hamburger menu opens and links are clickable"
        ],
        tips: [
            "Додайте конфігурацію мобільних девайсів у `playwright.config.ts` у розділ `projects`"
        ],
        tipsRu: [
            "Добавьте конфигурацию мобильных устройств в `playwright.config.ts` в раздел `projects`"
        ],
        tipsEn: [
            "Add mobile device configs to the `projects` section in `playwright.config.ts`"
        ]
    },

    // 9. Visual Testing
    "visual": {
        language: "typescript",
        category: "TypeScript • Snapshot Regression",
        starterCode: `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('should match milestone qualification scale snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');

    // Wait for fonts and dashboard cards to render
    const milestoneCard = page.locator('.milestone-card, [data-testid="milestone-card"]').first();
    await expect(milestoneCard).toBeVisible();

    // Snapshot comparison with disabled animations
    await expect(milestoneCard).toHaveScreenshot('qualification-scale.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.05
    });
  });
});`,
        acceptanceCriteria: [
            "Фіксація viewport 1280x800",
            "Вимкнення CSS анімацій перед знімком (`animations: 'disabled'`)",
            "Порівняння скріншоту через `toHaveScreenshot` з допустимим threshold"
        ],
        acceptanceCriteriaRu: [
            "Фиксация viewport 1280x800",
            "Отключение CSS анимаций перед снимком (`animations: 'disabled'`)",
            "Сравнение скриншота через `toHaveScreenshot` с допустимым threshold"
        ],
        acceptanceCriteriaEn: [
            "Fix viewport at 1280x800",
            "Disable CSS animations before snapshot (`animations: 'disabled'`)",
            "Compare screenshot via `toHaveScreenshot` with acceptable threshold"
        ],
        tips: [
            "Для першого створення знімка запустіть `npx playwright test --update-snapshots`"
        ],
        tipsRu: [
            "Для первого создания снимка запустите `npx playwright test --update-snapshots`"
        ],
        tipsEn: [
            "Run `npx playwright test --update-snapshots` to create the initial baseline snapshot"
        ]
    },

    // 10. CI/CD Matrix
    "cicd": {
        language: "yaml",
        category: "CI/CD • GitHub Actions Workflow",
        starterCode: `name: Playwright Cross-Language E2E Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Run Tests on \${{ matrix.stack }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        stack: [typescript, python, csharp]

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js (for TypeScript & Report)
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Python
        if: matrix.stack == 'python'
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Setup .NET
        if: matrix.stack == 'csharp'
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run TypeScript Tests
        if: matrix.stack == 'typescript'
        run: |
          npm ci
          npx playwright test

      - name: Run Python Tests
        if: matrix.stack == 'python'
        run: |
          pip install -r requirements.txt
          pytest -v

      - name: Run C# Tests
        if: matrix.stack == 'csharp'
        run: |
          dotnet test

      - name: Upload Test Report Artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-\${{ matrix.stack }}
          path: playwright-report/
          retention-days: 14`,
        acceptanceCriteria: [
            "Пайплайн запускається на Push та Pull Request",
            "Використання Matrix strategy для 3 стеків",
            "Інсталяція браузерів через `npx playwright install --with-deps`",
            "Збереження HTML артефактів після завершення тестів"
        ],
        acceptanceCriteriaRu: [
            "Пайплайн запускается на Push и Pull Request",
            "Использование Matrix strategy для 3 стеков",
            "Установка браузеров через `npx playwright install --with-deps`",
            "Сохранение HTML артефактов после завершения тестов"
        ],
        acceptanceCriteriaEn: [
            "Pipeline triggers on Push and Pull Request",
            "Matrix strategy used for 3 stacks (TS / Python / C#)",
            "Browsers installed via `npx playwright install --with-deps`",
            "HTML test report artifacts uploaded after test run"
        ],
        tips: [
            "Прапорець `fail-fast: false` дозволяє продовжити тестування інших стеків у разі падіння одного"
        ],
        tipsRu: [
            "Флаг `fail-fast: false` позволяет продолжить тестирование других стеков при падении одного"
        ],
        tipsEn: [
            "`fail-fast: false` allows other matrix stacks to continue even if one fails"
        ]
    },

    // 10. Premier Online: Base POM & Fixtures
    "premier-base-pom": {
        language: "typescript",
        category: "TypeScript • POM Architecture & Fixtures",
        starterCode: `// src/pages/BasePage.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string = ''): Promise<void> {
    await this.page.goto(path);
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: \`test-results/\${name}.png\` });
  }
}

// src/fixtures/testFixtures.ts
import { test as base, expect } from '@playwright/test';
import { EventCalendarPage } from '../pages/EventCalendarPage';

type CustomFixtures = {
  calendarPage: EventCalendarPage;
};

export const test = base.extend<CustomFixtures>({
  calendarPage: async ({ page }, use) => {
    const calendarPage = new EventCalendarPage(page);
    await calendarPage.open('/event-calendar');
    await use(calendarPage);
  },
});

export { expect };`,
        acceptanceCriteria: [
            "Клас BasePage містить методи open(), waitForLoaded(), getTitle()",
            "Фікстура calendarPage автоматично ініціалізує сторінку перед тестом",
            "Тести не містять ручних викликів `new BasePage(page)`",
            "Усі сторінки наслідують BasePage"
        ],
        acceptanceCriteriaRu: [
            "Класс BasePage содержит методы open(), waitForLoaded(), getTitle()",
            "Фикстура calendarPage автоматически инициализирует страницу перед тестом",
            "Тесты не содержат ручных вызовов `new BasePage(page)`",
            "Все страницы наследуют BasePage"
        ],
        acceptanceCriteriaEn: [
            "BasePage class contains open(), waitForLoaded(), getTitle() methods",
            "calendarPage fixture automatically initializes the page before each test",
            "Tests do not contain manual `new BasePage(page)` calls",
            "All page objects extend BasePage"
        ],
        tips: [
            "Використовуйте Custom Fixtures для інкапсуляції сетапу та тірдауну сторінок",
            "BasePage повинна бути абстрактною (abstract class) або містити захищений конструктор"
        ],
        tipsRu: [
            "Используйте Custom Fixtures для инкапсуляции сетапа и тирдауна страниц",
            "BasePage должна быть абстрактным классом (abstract class) или содержать защищённый конструктор"
        ],
        tipsEn: [
            "Use Custom Fixtures to encapsulate page setup and teardown logic",
            "BasePage should be abstract or have a protected constructor"
        ]
    },

    // 11. Premier Online: EventCalendarPage POM
    "premier-calendar": {
        language: "typescript",
        category: "TypeScript • EventCalendarPage POM",
        starterCode: `// src/pages/EventCalendarPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EventCalendarPage extends BasePage {
  readonly searchInput: Locator;
  readonly eventCards: Locator;
  readonly clearFiltersBtn: Locator;
  readonly emptyStateMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder(/search events/i);
    this.eventCards = page.locator('.event-card, [data-testid="event-card"]');
    this.clearFiltersBtn = page.getByRole('button', { name: /clear filters|reset/i });
    this.emptyStateMsg = page.getByText(/no events found/i);
  }

  async filterByCategory(categoryName: string): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(categoryName, 'i') }).click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getEventsCount(): Promise<number> {
    return this.eventCards.count();
  }

  async verifyAllEventsContainText(expectedText: string): Promise<void> {
    const count = await this.getEventsCount();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(this.eventCards.nth(i)).toContainText(new RegExp(expectedText, 'i'));
    }
  }
}`,
        acceptanceCriteria: [
            "Інкапсуляція селекторів пошуку та фільтрації у відповідні методи",
            "Web-first assertions (expect(locator).toBeVisible())",
            "Перевірка відсутності жорстких таймаутів (waitForTimeout заборонено)"
        ],
        acceptanceCriteriaRu: [
            "Инкапсуляция селекторов поиска и фильтрации в соответствующие методы",
            "Web-first assertions (expect(locator).toBeVisible())",
            "Проверка отсутствия жёстких таймаутов (waitForTimeout запрещён)"
        ],
        acceptanceCriteriaEn: [
            "Search and filter selectors encapsulated into dedicated methods",
            "Web-first assertions used (expect(locator).toBeVisible())",
            "No hard timeouts present (waitForTimeout is forbidden)"
        ],
        tips: [
            "Використовуйте `page.getByRole('button', { name: ... })` замість ненадійних CSS-класів"
        ],
        tipsRu: [
            "Используйте `page.getByRole('button', { name: ... })` вместо ненадёжных CSS-классов"
        ],
        tipsEn: [
            "Prefer `page.getByRole('button', { name: ... })` over fragile CSS class selectors"
        ]
    },

    // 12. Premier Online: EventDetailsPage POM
    "premier-details": {
        language: "typescript",
        category: "TypeScript • EventDetailsPage POM",
        starterCode: `// src/pages/EventDetailsPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EventDetailsPage extends BasePage {
  readonly titleHeading: Locator;
  readonly registerBtn: Locator;
  readonly priceDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeading = page.getByRole('heading', { level: 1 });
    this.registerBtn = page.getByRole('button', { name: /register now|enter event/i });
    this.priceDisplay = page.locator('.event-price, [data-testid="event-price"]');
  }

  async selectDistance(distanceName: string): Promise<void> {
    const option = this.page.locator('.distance-option').filter({ hasText: distanceName });
    await option.click();
  }

  async getPriceText(): Promise<string> {
    return (await this.priceDisplay.textContent()) || '';
  }

  async isRegistrationClosed(): Promise<boolean> {
    const soldOutBadge = this.page.getByText(/sold out|registration closed/i);
    return soldOutBadge.isVisible();
  }
}`,
        acceptanceCriteria: [
            "Вибір дистанції оновлює відображувану ціну",
            "Кнопка 'Register Now' доступна тільки для відкритих категорій",
            "Для категорій 'Sold Out' відображається статус або кнопка вимкнена"
        ],
        acceptanceCriteriaRu: [
            "Выбор дистанции обновляет отображаемую цену",
            "Кнопка 'Register Now' доступна только для открытых категорий",
            "Для категорий 'Sold Out' отображается статус или кнопка отключена"
        ],
        acceptanceCriteriaEn: [
            "Selecting a distance updates the displayed price",
            "'Register Now' button is active only for open categories",
            "'Sold Out' categories show a status badge or disabled button"
        ],
        tips: [
            "Парсіть числове значення ціни за допомогою `parseFloat(priceText.replace(/[^0-9.]/g, ''))`"
        ],
        tipsRu: [
            "Парсите числовое значение цены с помощью `parseFloat(priceText.replace(/[^0-9.]/g, ''))`"
        ],
        tipsEn: [
            "Parse the numeric price value using `parseFloat(priceText.replace(/[^0-9.]/g, ''))`"
        ]
    },

    // 13. Premier Online: CheckoutPage POM
    "premier-checkout": {
        language: "typescript",
        category: "TypeScript • CheckoutPage & Promo POM",
        starterCode: `// src/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly subtotalAmount: Locator;
  readonly vatAmount: Locator;
  readonly totalAmount: Locator;
  readonly promoInput: Locator;
  readonly applyPromoBtn: Locator;
  readonly promoError: Locator;

  constructor(page: Page) {
    super(page);
    this.subtotalAmount = page.locator('[data-testid="subtotal"]');
    this.vatAmount = page.locator('[data-testid="vat"]');
    this.totalAmount = page.locator('[data-testid="total"]');
    this.promoInput = page.getByPlaceholder(/promo code|voucher/i);
    this.applyPromoBtn = page.getByRole('button', { name: /apply/i });
    this.promoError = page.locator('.promo-error, [role="alert"]');
  }

  async applyVoucher(code: string): Promise<void> {
    await this.promoInput.fill(code);
    await this.applyPromoBtn.click();
  }

  async verifyInvalidVoucherMessage(): Promise<void> {
    await expect(this.promoError).toBeVisible();
    await expect(this.promoError).toContainText(/invalid|expired/i);
  }
}`,
        acceptanceCriteria: [
            "Перевірка підсумку: Total = Subtotal + VAT + ServiceFee",
            "Валідація повідомлення про помилку при недійсному промокоді",
            "Округлення фінансових сум до 2 знаків"
        ],
        acceptanceCriteriaRu: [
            "Проверка итога: Total = Subtotal + VAT + ServiceFee",
            "Валидация сообщения об ошибке при недействительном промокоде",
            "Округление финансовых сумм до 2 знаков"
        ],
        acceptanceCriteriaEn: [
            "Verify total: Total = Subtotal + VAT + ServiceFee",
            "Validate error message for invalid promo code",
            "Financial amounts rounded to 2 decimal places"
        ],
        tips: [
            "Перевіряйте зміну Total після застосування успішного промокоду"
        ],
        tipsRu: [
            "Проверяйте изменение Total после применения успешного промокода"
        ],
        tipsEn: [
            "Verify that Total updates correctly after applying a valid promo code"
        ]
    },

    // 14. Premier Online: Payment Route Interception
    "premier-payment": {
        language: "typescript",
        category: "TypeScript • Network Route Interception",
        starterCode: `// src/utils/PaymentMockHelper.ts
import { Page, Route } from '@playwright/test';

export class PaymentMockHelper {
  static async mockDeclinedPayment(page: Page): Promise<void> {
    await page.route('**/payment/process', async (route: Route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Card declined: Insufficient funds',
          code: 'PAYMENT_DECLINED'
        }),
      });
    });
  }

  static async mockSuccessfulPayment(page: Page, orderId: string = 'ORD-2026-9988'): Promise<void> {
    await page.route('**/payment/process', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId,
          transactionId: 'TXN-99881122',
        }),
      });
    });
  }
}`,
        acceptanceCriteria: [
            "Перехоплення POST запиту до платіжного шлюзу через page.route",
            "Мокування статусу 402 з тілом відхиленої карти",
            "Перевірка показу червоного алерта користувачу без падіння сторінки",
            "Мокування 200 OK з генерацією успішного номера замовлення"
        ],
        acceptanceCriteriaRu: [
            "Перехват POST запроса к платёжному шлюзу через page.route",
            "Мокирование статуса 402 с телом отклонённой карты",
            "Проверка показа красного алерта пользователю без падения страницы",
            "Мокирование 200 OK с генерацией успешного номера заказа"
        ],
        acceptanceCriteriaEn: [
            "Intercept POST request to payment gateway via page.route",
            "Mock 402 status with declined card response body",
            "Verify red alert shown to user without page crash",
            "Mock 200 OK with generated successful order number"
        ],
        tips: [
            "Використовуйте `await page.unroute('**/payment/process')` для очищення моків"
        ],
        tipsRu: [
            "Используйте `await page.unroute('**/payment/process')` для очистки моков"
        ],
        tipsEn: [
            "Use `await page.unroute('**/payment/process')` to clean up mocks after the test"
        ]
    }
};

export function getTaskHelper(taskTitle: string, taskDesc?: string | null): TaskHelperData {
    const t = (taskTitle + " " + (taskDesc || "")).toLowerCase();
    
    // Premier Online specific matchers
    if (t.includes("basepage") || t.includes("фікстур") || t.includes("fixtures")) return TASK_SNIPPETS["premier-base-pom"];
    if (t.includes("eventcalendar") || t.includes("календар") || t.includes("категорі") || (t.includes("пошук") && t.includes("подій"))) return TASK_SNIPPETS["premier-calendar"];
    if (t.includes("eventdetails") || t.includes("дистанці") || t.includes("sold out") || t.includes("матриц")) return TASK_SNIPPETS["premier-details"];
    if (t.includes("checkout") || t.includes("кошик") || t.includes("промокод") || t.includes("vat") || t.includes("підсумк")) return TASK_SNIPPETS["premier-checkout"];
    if (t.includes("платіжн") || t.includes("шлюз") || (t.includes("мокування") && t.includes("оплат"))) return TASK_SNIPPETS["premier-payment"];

    // Generic matchers
    if (t.includes("pom") || t.includes("page object")) return TASK_SNIPPETS["pom"];
    if (t.includes("verify") || t.includes("верифікація") || t.includes("linkedin")) return TASK_SNIPPETS["verify"];
    if (t.includes("network") || t.includes("мокування") || t.includes("route")) return TASK_SNIPPETS["network"];
    if (t.includes("mobile") || t.includes("адаптивність") || t.includes("кросбраузер") || t.includes("бургер")) return TASK_SNIPPETS["mobile"];
    if (t.includes("visual") || t.includes("snapshot") || t.includes("знімк")) return TASK_SNIPPETS["visual"];
    if (t.includes("ci/cd") || t.includes("github actions") || t.includes("пайплайн")) return TASK_SNIPPETS["cicd"];
    if (t.includes("python") && (t.includes("контакт") || t.includes("профіл"))) return TASK_SNIPPETS["python-profile"];
    if (t.includes("python")) return TASK_SNIPPETS["python-api"];
    if (t.includes("c#") || t.includes(".net") || t.includes("тренажер")) return TASK_SNIPPETS["csharp"];
    return TASK_SNIPPETS["auth"];
}
