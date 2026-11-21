export interface CuratedQuestion {
    id: number
    roleLevel: 'junior' | 'middle' | 'senior'
    category: string
    questionEn: string
    questionUk: string
    questionRu: string
    idealAnswerEn: string
    idealAnswerUk: string
    idealAnswerRu: string
    keywords: string[]
}

export const INTERVIEW_QUESTIONS_BANK: CuratedQuestion[] = [
    // ==========================================
    // JUNIOR QUESTIONS
    // ==========================================
    {
        id: 1,
        roleLevel: 'junior',
        category: 'Playwright Core & Locators',
        questionEn: "How does Playwright handle auto-waiting, and how does it prevent test flakiness compared to older tools like Selenium?",
        questionUk: "Як Playwright реалізує механізм автоматичного очікування (auto-waiting), і як це запобігає нестабільності (flakiness) тестів у порівнянні з Selenium?",
        questionRu: "Как Playwright реализует механизм автоматического ожидания (auto-waiting), и как это предотвращает нестабильность (flakiness) тестов по сравнению с Selenium?",
        idealAnswerEn: "Playwright performs automatic actionability checks before performing actions (e.g. click, fill). It verifies that the element is attached to the DOM, visible, stable, enabled, and receives pointer events. It waits up to the timeout automatically, eliminating the need for arbitrary sleep/waitForTimeout calls.",
        idealAnswerUk: "Playwright автоматично виконує перевірки доступності (actionability checks) перед діями: перевіряє, що елемент прикріплений до DOM, видимий, стабільний, активний (enabled) та готовий приймати кліки. Це усуває потребу в статичних паузах (sleep) чи явних очікуваннях.",
        idealAnswerRu: "Playwright автоматически выполняет проверки доступности (actionability checks) перед действиями: проверяет, что элемент прикреплен к DOM, видим, стабилен, активен (enabled) и не перекрыт другими элементами. Это избавляет от необходимости писать ручные задержки (sleep).",
        keywords: ["actionability", "visible", "stable", "attached", "enabled", "sleep", "timeout", "flakiness"]
    },
    {
        id: 2,
        roleLevel: 'junior',
        category: 'Locators Best Practices',
        questionEn: "Which locator strategies are recommended by Playwright's best practices, and why should you avoid XPath or CSS class selectors when possible?",
        questionUk: "Які стратегії пошуку локаторів є рекомендованими за найкращими практиками Playwright, і чому варто уникати XPath або селекторів за CSS-класами?",
        questionRu: "Какие стратегии поиска локаторов рекомендуются лучшими практиками Playwright, и почему следует избегать XPath или селекторов по CSS-классам?",
        idealAnswerEn: "Playwright prioritizes user-facing role-based locators: page.getByRole(), getByText(), getByLabel(), getByPlaceholder(), and getByTestId(). They resemble real user interaction, improve accessibility, and don't break when CSS styles or DOM structure change, unlike fragile CSS/XPath selectors.",
        idealAnswerUk: "Playwright рекомендує людиноорієнтовані локатори: page.getByRole(), getByText(), getByLabel(), getByPlaceholder() та getByTestId(). Вони імітують взаємодію реального користувача, підтримують доступність (accessibility) і не ламаються при зміні стилів чи верстки, на відміну від крихких CSS/XPath.",
        idealAnswerRu: "Playwright рекомендует использовать ориентированные на пользователя локаторы: page.getByRole(), getByText(), getByLabel(), getByPlaceholder() и getByTestId(). Они соответствуют поведению пользователя, улучшают доступность и устойчивы к изменениям верстки и CSS-классов.",
        keywords: ["getByRole", "getByText", "getByTestId", "accessibility", "resilient", "fragile", "user-facing"]
    },
    {
        id: 3,
        roleLevel: 'junior',
        category: 'Assertions & Web First',
        questionEn: "What is the difference between standard assertions and Playwright's web-first assertions like expect(locator).toBeVisible()?",
        questionUk: "У чому різниця між стандартними assertions і web-first асершнами Playwright, такими як expect(locator).toBeVisible()?",
        questionRu: "В чем разница между стандартными assertions и web-first ассертами Playwright, такими как expect(locator).toBeVisible()?",
        idealAnswerEn: "Web-first assertions like expect(locator).toBeVisible() automatically retry until the condition is met or the timeout expires. In contrast, evaluating a condition imperatively (e.g. expect(await locator.isVisible()).toBe(true)) checks only once instantly without retrying, leading to flaky tests if the DOM is still rendering.",
        idealAnswerUk: "Web-first асершни автоматично повторюють перевірку (retry), доки умова не виконається або не вийде таймаут. Натомість імперативна перевірка expect(await locator.isVisible()).toBe(true) перевіряє стан лише один раз у поточну мілісекунду і падає, якщо елемент рендериться із затримкою.",
        idealAnswerRu: "Web-first ассерты автоматически повторяют проверку (retry) до тех пор, пока условие не выполнится или не истечет таймаут. В отличие от них, expect(await locator.isVisible()).toBe(true) делает мгновенную разовую проверку и падает при асинхронном рендере.",
        keywords: ["retry", "polling", "async", "timeout", "web-first", "flaky", "rendering"]
    },
    {
        id: 4,
        roleLevel: 'junior',
        category: 'Browser Contexts & Isolation',
        questionEn: "What is a BrowserContext in Playwright, and why is creating a context faster than launching a new browser instance?",
        questionUk: "Що таке BrowserContext у Playwright, і чому створення контексту набагато швидше, ніж запуск нового екземпляра браузера?",
        questionRu: "Что такое BrowserContext в Playwright, и почему создание контекста намного быстрее, чем запуск нового экземпляра браузера?",
        idealAnswerEn: "A BrowserContext is an isolated incognito-like session within a single running browser instance. Creating a context takes milliseconds and provides full isolation of cookies, localStorage, and cache between tests without the heavy operating system overhead of launching a brand new browser process.",
        idealAnswerUk: "BrowserContext — це ізольована сесія (на кшталт режиму інкогніто) в межах одного запущеного браузера. Його створення займає мілісекунди і гарантує повну ізоляцію cookies, localStorage та кешу між тестами без високих витрат ресурсів ОС на запуск нового процесу браузера.",
        idealAnswerRu: "BrowserContext — это изолированная сессия (аналог инкогнито) внутри одного запущенного браузера. Создание контекста занимает миллисекунды и обеспечивает полную изоляцию cookies, localStorage и кэша между тестами без тяжелого запуска нового процесса ОС.",
        keywords: ["incognito", "isolation", "cookies", "storage", "fast", "overhead", "process"]
    },
    {
        id: 5,
        roleLevel: 'junior',
        category: 'Debugging & Tooling',
        questionEn: "How do you debug a failing Playwright test, and what is Playwright Trace Viewer?",
        questionUk: "Як ви дебажите тест у Playwright, що впав, і що таке Playwright Trace Viewer?",
        questionRu: "Как вы дебажите упавший тест в Playwright, и что такое Playwright Trace Viewer?",
        idealAnswerEn: "Playwright offers UI Mode, test.step, debug mode with PWDEBUG=1, and the Trace Viewer. Trace Viewer records DOM snapshots before and after each action, console logs, network traffic, source code, and a visual timeline, allowing post-execution inspection of why a test failed without re-running it.",
        idealAnswerUk: "Для дебагу є режим з графічним інтерфейсом (UI mode), запуск з PWDEBUG=1, покроковий режим та Trace Viewer. Trace Viewer записує знімки DOM до і після кожної дії, логи консолі, мережевий трафік, вихідний код і таймлайн, дозволяючи розібрати падіння без перезапуску.",
        idealAnswerRu: "Для отладки используются UI Mode, режим с инспектором PWDEBUG=1 и Trace Viewer. Trace Viewer сохраняет снапшоты DOM до и после каждого действия, консольные логи, сетевые запросы и таймлайн, позволяя детально изучить падение теста постфактум.",
        keywords: ["Trace Viewer", "UI Mode", "PWDEBUG", "network", "snapshot", "console", "timeline"]
    },

    // ==========================================
    // MIDDLE QUESTIONS
    // ==========================================
    {
        id: 6,
        roleLevel: 'middle',
        category: 'Page Object Model Architecture',
        questionEn: "How do you structure a maintainable Page Object Model (POM) in Playwright using TypeScript, and what should Page Objects NEVER do?",
        questionUk: "Як ви структуруєте підтримуваний Page Object Model (POM) у Playwright на TypeScript, і чого Page Objects НІКОЛИ не повинні робити?",
        questionRu: "Как вы структурируете поддерживаемый Page Object Model (POM) в Playwright на TypeScript, и чего Page Objects НИКОГДА не должны делать?",
        idealAnswerEn: "A Page Object should encapsulate locators as readonly properties and user actions as async methods (e.g. login, fillPayment). Page Objects should NEVER contain test-level assertions or expect statements (except internal UI readiness checks), because assertions belong in the test files to keep pages reusable and decoupled from specific test scenarios.",
        idealAnswerUk: "Page Object повинен інкапсулювати локатори як readonly властивості та дії користувача як асинхронні методи (наприклад, login). Page Objects НЕ повинні містити асершни (expect) тестового рівня (крім внутрішніх перевірок готовності UI), оскільки бізнес-перевірки належать файлам тестів для повторного використання сторінок.",
        idealAnswerRu: "Page Object должен инкапсулировать локаторы как readonly свойства и действия пользователя как асинхронные методы (например, login). Page Objects НЕ должны содержать тестовые ассерты expect (кроме внутренних проверок готовности UI), так как проверки бизнес-логики должны находиться в самих тестах.",
        keywords: ["encapsulate", "locators", "actions", "assertions", "expect", "reusable", "decoupled"]
    },
    {
        id: 7,
        roleLevel: 'middle',
        category: 'Custom Fixtures',
        questionEn: "What are Playwright Test Fixtures, how do they improve upon traditional beforeEach/afterEach hooks, and how do you implement a custom authenticated fixture?",
        questionUk: "Що таке Test Fixtures у Playwright, у чому їх перевага над традиційними beforeEach/afterEach хуками, та як реалізувати кастомну авторизовану фікстуру?",
        questionRu: "Что такое Test Fixtures в Playwright, в чем их преимущество над традиционными хуками beforeEach/afterEach, и как реализовать кастомную авторизованную фикстуру?",
        idealAnswerEn: "Fixtures in Playwright are composable, isolated, and on-demand dependencies created using test.extend(). Unlike global beforeEach hooks which run blindly for every test, fixtures execute only when declared in test arguments. An authenticated fixture sets up state, yields with await use(page), and automatically cleans up teardown logic after test completion.",
        idealAnswerUk: "Фікстури Playwright — це ізольовані залежності, що створюються через test.extend(). На відміну від beforeEach, який сліпо виконується перед кожним тестом, фікстура запускається лише коли її передали в аргументи конкретного тесту. Вона налаштовує стан, передає керування через await use(), і сама виконує teardown після тесту.",
        idealAnswerRu: "Фикстуры Playwright — это изолированные, компонуемые зависимости через test.extend(). В отличие от beforeEach, они инициализируются только по требованию (on-demand), когда указаны в аргументах теста. Фикстура готовит окружение, отдает управление через await use(), а затем выполняет teardown.",
        keywords: ["test.extend", "use", "teardown", "on-demand", "isolated", "composable", "hooks"]
    },
    {
        id: 8,
        roleLevel: 'middle',
        category: 'Network Interception & Mocking',
        questionEn: "How does page.route() work in Playwright, and when would you mock API responses vs calling the real backend in E2E automation?",
        questionUk: "Як працює page.route() у Playwright, і коли доцільно мокувати API-відповіді замість виклику реального бекенду в E2E тестах?",
        questionRu: "Как работает page.route() в Playwright, и в каких случаях целесообразно мокировать API-ответы вместо вызова реального бэкенда в E2E тестах?",
        idealAnswerEn: "page.route() intercepts network traffic at the browser engine level. You can fulfill with mock JSON, abort third-party trackers, or modify headers. Mocking is ideal for edge cases (server 500 errors, rate limits, slow network, payment gateways, complex data setup). Real backend calls are reserved for critical happy-path integration tests.",
        idealAnswerUk: "page.route() перехоплює мережеві запити на рівні браузерного рушія. Можна повертати фейковий JSON (route.fulfill), блокувати аналітику (route.abort) або модифікувати заголовки. Мокування незамінне для крайових випадків: 500 помилки сервера, платіжні шлюзи, ліміти. Реальний бекенд залишають для критичних end-to-end інтеграційних тестів.",
        idealAnswerRu: "page.route() перехватывает сетевые запросы на уровне движка браузера. Можно возвращать мок JSON (route.fulfill), блокировать внешние скрипты или менять заголовки. Мокирование идеально для редких и негативных сценариев: ошибки 500, симуляция задержек, платежные шлюзы, в то время как реальный бэкенд нужен для критических сквозных сценариев.",
        keywords: ["route", "fulfill", "abort", "intercept", "payment", "edge cases", "500 error", "speed"]
    },
    {
        id: 9,
        roleLevel: 'middle',
        category: 'Authentication & Session Reuse',
        questionEn: "Explain how storageState works in Playwright and how it drastically reduces test suite execution time.",
        questionUk: "Поясніть, як працює storageState у Playwright і як цей механізм кардинально скорочує час виконання набору тестів.",
        questionRu: "Объясните, как работает storageState в Playwright и как этот механизм кардинально сокращает время выполнения набора тестов.",
        idealAnswerEn: "storageState captures authenticated browser state (cookies and localStorage) into a JSON file during an initial setup project. Subsequent tests specify storageState in their configuration and start directly in an authenticated session without having to log in through the UI for every test, saving seconds per test.",
        idealAnswerUk: "storageState зберігає авторизаційний стан браузера (cookies та localStorage) у JSON-файл під час одного підготовчого setup-тесту. Усі наступні тести завантажують цей стан і стартують вже залогіненими, не витрачаючи час на введення логіна та пароля у кожному тесті.",
        idealAnswerRu: "storageState сохраняет cookies и localStorage авторизованной сессии в JSON-файл в одном setup-тесте. Все остальные тесты считывают этот файл конфигурацией и сразу открывают нужные страницы авторизованными, что экономит кучу времени при сотнях тестов.",
        keywords: ["storageState", "cookies", "localStorage", "setup project", "authentication", "speed", "session"]
    },
    {
        id: 10,
        roleLevel: 'middle',
        category: 'API Testing & Integration',
        questionEn: "How do you perform API testing using Playwright's APIRequestContext, and how can it be used in conjunction with UI tests?",
        questionUk: "Як виконувати тестування API за допомогою APIRequestContext у Playwright, і як це можна поєднувати з UI-тестами?",
        questionRu: "Как выполнять тестирование API с помощью APIRequestContext в Playwright, и как это можно совмещать с UI-тестами?",
        idealAnswerEn: "Playwright provides request.newContext() or the built-in 'request' fixture to send direct HTTP requests (GET, POST, PUT, DELETE). In UI tests, it is commonly used for test data pre-seeding (creating users, orders via API in seconds) and post-test teardown, bypassing slow UI forms for test setup.",
        idealAnswerUk: "Playwright надає фікстуру 'request' для виконання прямих HTTP-запитів (GET, POST тощо). У UI-тестах це використовується для швидкої підготовки тестових даних (створення користувача, замовлення через API за 100 мс замість заповнення довгих форм через UI) та швидкого очищення (teardown).",
        idealAnswerRu: "Playwright предоставляет встроенную фикстуру 'request' для прямых HTTP-запросов. В UI-тестах это применяется для моментальной подготовки тестовых данных (создание юзера или заказа через API за секунду вместо кликов по формам) и быстрого удаления данных в конце теста.",
        keywords: ["APIRequestContext", "request", "seed", "preconditions", "teardown", "HTTP", "hybrid"]
    },

    // ==========================================
    // SENIOR QUESTIONS
    // ==========================================
    {
        id: 11,
        roleLevel: 'senior',
        category: 'Architecture & CI/CD Sharding',
        questionEn: "How do you design a scalable Playwright CI/CD pipeline in GitHub Actions that runs 1,000+ tests under 10 minutes? Mention sharding, caching, and reporting.",
        questionUk: "Як ви спроєктуєте масштабований CI/CD пайплайн Playwright у GitHub Actions для запуску 1000+ тестів менше ніж за 10 хвилин? Вкажіть шардинг, кешування та звітність.",
        questionRu: "Как вы спроектируете масштабируемый CI/CD пайплайн Playwright в GitHub Actions для запуска 1000+ тестов менее чем за 10 минут? Укажите шардинг, кэширование и отчетность.",
        idealAnswerEn: "Use matrix strategy for sharding (e.g. 5–10 parallel jobs with --shard=x/N). Cache npm dependencies and Playwright browser binaries with actions/cache. Separate setup projects (auth). In the final pipeline stage, merge individual shard blob reports using 'npx playwright merge-reports' to generate a unified HTML report.",
        idealAnswerUk: "Використати матричний шардинг у GitHub Actions (наприклад, 10 паралельних раннерів з прапорцем --shard=x/N). Налаштувати кешування node_modules та бінарників браузерів. Винести генерацію auth storageState в окремий крок. У фінальному кроці об'єднати blob-звіти за допомогою npx playwright merge-reports у єдиний HTML-звіт.",
        idealAnswerRu: "Использовать матричную стратегию шардинга в GitHub Actions (например, 10 параллельных runner-ов с --shard=x/N). Кэшировать зависимости и бинарники браузеров. Сессии авторизации вынести в setup. В финальной джобе объединить артефакты через npx playwright merge-reports в общий отчет.",
        keywords: ["sharding", "matrix", "merge-reports", "cache", "blob", "parallel", "GitHub Actions"]
    },
    {
        id: 12,
        roleLevel: 'senior',
        category: 'Flakiness Elimination & Root Cause Analysis',
        questionEn: "What systemic engineering practices do you establish in an automation team to diagnose, quarantine, and eliminate test flakiness?",
        questionUk: "Які системні інженерні практики ви впроваджуєте в команді автоматизації для виявлення, карантину та викорінення нестабільних (flaky) тестів?",
        questionRu: "Какие системные инженерные практики вы внедряете в команде автоматизации для выявления, карантина и устранения нестабильных (flaky) тестов?",
        idealAnswerEn: "1. Flakiness dashboard/metrics tracking pass-rate variance. 2. Automated quarantine: flaky tests run in a non-blocking suite. 3. Ban static sleeps in code reviews (ESLint rules). 4. Use Trace Viewer for root cause (race conditions, animations, network delays). 5. Atomic independent test data per worker to prevent state pollution.",
        idealAnswerUk: "1. Метрики та дашборд нестабільності тестів. 2. Карантин: флакі-тести ізолюються в окремий non-blocking набір. 3. Заборона static sleeps на рівні ESLint та код-рев'ю. 4. Аналіз гонок станів (race conditions) та анімацій через Trace Viewer. 5. Повна атомарність тестових даних під кожен worker без спільного стану.",
        idealAnswerRu: "1. Мониторинг метрик flakiness и стабильности в CI. 2. Карантин: нестабильные тесты изолируются, не блокируя релизный пайплайн. 3. Запрет waitForTimeout через ESLint. 4. Разбор race conditions и сетевых задержек через Trace Viewer. 5. Изоляция тестовых данных: каждый воркер работает со своими сущностями.",
        keywords: ["quarantine", "metrics", "ESLint", "race conditions", "isolation", "Trace Viewer", "atomic"]
    },
    {
        id: 13,
        roleLevel: 'senior',
        category: 'Framework Design & Extensibility',
        questionEn: "How do you design a custom reporter in Playwright to publish real-time test execution metrics to Slack, DataDog, or an internal dashboard?",
        questionUk: "Як реалізувати кастомний репортер у Playwright для відправки метрик виконання тестів у реальному часі в Slack, DataDog або внутрішній дашборд?",
        questionRu: "Как реализовать кастомный репортер в Playwright для отправки метрик выполнения тестов в реальном времени в Slack, DataDog или внутренний дашборд?",
        idealAnswerEn: "Implement Playwright's Reporter interface with lifecycle hooks: onBegin (suite info), onTestBegin, onTestEnd (status, duration, error details, retry count), and onEnd (full summary). In onTestEnd or onEnd, send asynchronous payloads or OpenTelemetry metrics to Slack Webhooks or monitoring APIs, ensuring exceptions during reporting don't fail the test run.",
        idealAnswerUk: "Реалізувати інтерфейс Reporter із хуками життєвого циклу: onBegin, onTestBegin, onTestEnd (статус, тривалість, помилка, ретраї) та onEnd (загальний підсумок). У хуку onTestEnd або onEnd асинхронно відправляти метрики у вебхук Slack або метрики DataDog/OpenTelemetry з обробкою помилок мережі.",
        idealAnswerRu: "Реализовать класс с интерфейсом Reporter, используя хуки жизненного цикла: onBegin, onTestBegin, onTestEnd (статус, время, стек ошибки, ретрай) и onEnd. В этих методах отправлять асинхронные запросы в вебхук Slack или метрики DataDog/OpenTelemetry, оборачивая сетевые вызовы в try/catch.",
        keywords: ["Reporter", "onTestEnd", "onBegin", "onEnd", "webhook", "metrics", "lifecycle"]
    },
    {
        id: 14,
        roleLevel: 'senior',
        category: 'Docker & Grid Execution',
        questionEn: "Why is running Playwright in Docker essential for enterprise CI, and how do you optimize Docker image size and execution speed?",
        questionUk: "Чому запуск Playwright у Docker є критичним для корпоративного CI, і як оптимізувати розмір образу Docker та швидкість виконання?",
        questionRu: "Почему запуск Playwright в Docker критичен для enterprise CI, и как оптимизировать размер Docker-образа и скорость выполнения?",
        idealAnswerEn: "Docker eliminates 'works on my machine' inconsistencies in font rendering, OS libraries, and Linux dependencies. Optimize by using official mcr.microsoft.com/playwright images, multi-stage builds, mounting test results via volumes instead of copying, and allocating sufficient shared memory (--ipc=host or /dev/shm) to prevent browser crashes.",
        idealAnswerUk: "Docker усуває різницю у рендерингу шрифтів, версіях OS та залежностях між локальною машиною та CI. Оптимізація: офіційний базовий образ mcr.microsoft.com/playwright, multi-stage build, виділення достатнього обсягу спільної пам'яті (--ipc=host або shm_size) для запобігання падінням Chromium.",
        idealAnswerRu: "Docker гарантирует одинаковое поведение тестов, рендеринг шрифтов и наличие библиотек на любой машине и в CI. Оптимизация: использовать официальный образ mcr.microsoft.com/playwright, multi-stage сборку, монтировать результаты через volumes и задавать --ipc=host для предотвращения крэшей памяти в Chromium.",
        keywords: ["Docker", "ipc=host", "shared memory", "font rendering", "multi-stage", "consistency"]
    },
    {
        id: 15,
        roleLevel: 'senior',
        category: 'Visual Regression & Performance',
        questionEn: "How do you implement visual regression testing with Playwright (toHaveScreenshot), and how do you handle dynamic content, anti-aliasing, and cross-platform font differences?",
        questionUk: "Як ви впроваджуєте тестування візуальних регресій у Playwright (toHaveScreenshot), і як вирішуєте проблеми динамічного контенту, згладжування (anti-aliasing) та крос-платформних шрифтів?",
        questionRu: "Как вы внедряете тестирование визуальных регрессий в Playwright (toHaveScreenshot), и как решаете проблемы динамического контента, сглаживания (anti-aliasing) и кросс-платформенных шрифтов?",
        idealAnswerEn: "1. Use toHaveScreenshot() with threshold and maxDiffPixelRatio tolerances. 2. Mask dynamic elements (timestamps, user avatars) via mask: [locator]. 3. Disable animations using animations: 'disabled'. 4. Run baseline generation and regression checks exclusively in the same Docker container to ensure identical font rendering and avoid OS-level anti-aliasing diffs.",
        idealAnswerUk: "1. Використовувати toHaveScreenshot() з налаштуванням threshold і maxDiffPixelRatio. 2. Маскувати динамічний контент (дати, банери) через опцію mask: [locators]. 3. Вимикати CSS-анімації (animations: 'disabled'). 4. Генерувати еталонні скріншоти та запускати тести суворо в однаковому Docker-контейнері для уникнення відмінностей шрифтів між Mac/Linux/Windows.",
        idealAnswerRu: "1. Использовать toHaveScreenshot() с порогом threshold и maxDiffPixelRatio. 2. Маскировать динамические элементы (часы, аватары) через mask: [locator]. 3. Отключать анимации через animations: 'disabled'. 4. Генерировать и сверять снимки строго внутри одного Docker-контейнера, чтобы исключить разницу сглаживания шрифтов на разных ОС.",
        keywords: ["toHaveScreenshot", "mask", "animations", "threshold", "Docker", "anti-aliasing", "baseline"]
    }
]

export function getQuestionsForLevel(level: 'junior' | 'middle' | 'senior', count: number = 5): CuratedQuestion[] {
    const list = INTERVIEW_QUESTIONS_BANK.filter(q => q.roleLevel === level)
    // Shuffle and pick `count` questions
    const shuffled = [...list].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}
