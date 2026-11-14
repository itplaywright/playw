export interface TaskHelperData {
    language: "typescript" | "python" | "csharp" | "yaml";
    category: string;
    starterCode: string;
    acceptanceCriteria: string[];
    tips: string[];
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
        tips: [
            "Використовуйте `page.waitForURL('**/dashboard')` замість статичних таймаутів",
            "Зберігайте паролі у файлі `.env` або через Test Fixtures",
            "Для скидання стану сесії запускайте тести в ізольованому браузерному контексті"
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
        tips: [
            "Використовуйте регулярні вирази в getByRole для підтримки мультимовності (UK/EN/RU)",
            "Не робіть викликів `page.waitForTimeout()` — покладайтесь на авто-очікування Playwright"
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
        tips: [
            "Використовуйте `expect(href).toContain(...)` для перевірки динамічних посилань"
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
        tips: [
            "Запускайте за допомогою `pytest -v tests/test_api_certs.py`",
            "Використовуйте pytest fixtures для підготовки авторизованого контексту"
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
        tips: [
            "Перевіряйте зміну даних повторним GET-запитом (Idempotency / Verification)"
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
        tips: [
            "Використовуйте `dotnet test` для запуску тестів",
            "Завантажте браузери через `pwsh bin/Debug/net8.0/playwright.ps1 install`"
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
        tips: [
            "Встановлюйте route до виклику `page.goto()`",
            "Можна мокувати як успішні (200), так і помилкові відповіді (500) для перевірки стійкості UI"
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
        tips: [
            "Додайте конфігурацію мобільних девайсів у `playwright.config.ts` у розділ `projects`"
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
        tips: [
            "Для першого створення знімка запустіть `npx playwright test --update-snapshots`"
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
        tips: [
            "Прапорець `fail-fast: false` дозволяє продовжити тестування інших стеків у разі падіння одного"
        ]
    }
};

export function getTaskHelper(taskTitle: string, taskDesc?: string | null): TaskHelperData {
    const t = (taskTitle + " " + (taskDesc || "")).toLowerCase();
    if (t.includes("pom") || t.includes("page object")) return TASK_SNIPPETS["pom"];
    if (t.includes("verify") || t.includes("верифікація") || t.includes("linkedin")) return TASK_SNIPPETS["verify"];
    if (t.includes("network") || t.includes("мокування") || t.includes("route")) return TASK_SNIPPETS["network"];
    if (t.includes("mobile") || t.includes("адаптивність") || t.includes("кросбраузер")) return TASK_SNIPPETS["mobile"];
    if (t.includes("visual") || t.includes("snapshot") || t.includes("знімк")) return TASK_SNIPPETS["visual"];
    if (t.includes("ci/cd") || t.includes("github actions") || t.includes("пайплайн")) return TASK_SNIPPETS["cicd"];
    if (t.includes("python") && (t.includes("контакт") || t.includes("профіл"))) return TASK_SNIPPETS["python-profile"];
    if (t.includes("python")) return TASK_SNIPPETS["python-api"];
    if (t.includes("c#") || t.includes(".net") || t.includes("тренажер")) return TASK_SNIPPETS["csharp"];
    return TASK_SNIPPETS["auth"];
}
