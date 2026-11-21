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
    },
    {
        "id": 16,
        "roleLevel": "junior",
        "category": "Frames & Shadow DOM",
        "questionEn": "How does Playwright interact with elements inside iframes and Shadow DOM trees, and why is this simpler than in Selenium?",
        "questionUk": "Як Playwright взаємодіє з елементами всередині iframe та Shadow DOM, і чому це набагато простіше, ніж у Selenium?",
        "questionRu": "Как Playwright взаимодействует с элементами внутри iframe и Shadow DOM, и почему это намного проще, чем в Selenium?",
        "idealAnswerEn": "Playwright pierces Shadow DOM boundaries by default with standard locators without extra syntax. For iframes, page.frameLocator() returns a locator for the frame, allowing intuitive chaining (e.g. page.frameLocator(\"iframe#payment\").getByRole(\"button\")) with full auto-waiting, without needing switchTo().frame() or switchTo().defaultContent().",
        "idealAnswerUk": "Playwright за замовчуванням пробиває межі Shadow DOM для всіх локаторів. Для iframes використовується page.frameLocator(), що дозволяє будувати ланцюжки (page.frameLocator(\"iframe\").getByRole(\"button\")) з повноцінним auto-waiting без потреби перемикання контексту через switchTo().",
        "idealAnswerRu": "Playwright по умолчанию пробивает Shadow DOM границы без дополнительных хаков. Для iframes используется page.frameLocator(), позволяющий связывать локаторы в цепочку с авто-ожиданием без необходимости ручного переключения switchTo().",
        "keywords": [
                "frameLocator",
                "Shadow DOM",
                "pierce",
                "iframe",
                "auto-waiting",
                "switchTo"
        ]
},
    {
        "id": 17,
        "roleLevel": "junior",
        "category": "Locator Filtering & Chaining",
        "questionEn": "How do you filter and chain locators in Playwright when selecting an item within a complex list or table card?",
        "questionUk": "Як фільтрувати та ланцюжком зв'язувати локатори у Playwright при виборі елемента у списку чи картці таблиці?",
        "questionRu": "Как фильтровать и объединять в цепочку локаторы в Playwright при выборе элемента в сложном списке или карточке?",
        "idealAnswerEn": "Use locator.filter({ hasText: \"Item Name\", has: page.getByRole(\"button\", { name: \"Buy\" }) }). This narrows down matched elements to the specific container containing the desired text or child element without using brittle indexed or parent XPath selectors.",
        "idealAnswerUk": "Використовуйте метод locator.filter({ hasText: \"Назва\", has: page.getByRole(\"button\") }). Це звужує вибірку до контейнера з відповідним дочірнім елементом або текстом, уникаючи крихких індексів чи складних XPath.",
        "idealAnswerRu": "Используйте locator.filter({ hasText: \"Текст\", has: locator }). Это позволяет точно отфильтровать нужный родительский блок или карточку без использования хрупких индексов или XPath.",
        "keywords": [
                "filter",
                "hasText",
                "has",
                "chaining",
                "container",
                "locator"
        ]
},
    {
        "id": 18,
        "roleLevel": "junior",
        "category": "Popups & Multiple Tabs",
        "questionEn": "How does Playwright handle multiple browser tabs, popups, and new windows originating from a link click?",
        "questionUk": "Як Playwright обробляє відкриття нових вкладок, pop-up вікон або додаткових сторінок після кліку на лінк?",
        "questionRu": "Как Playwright обрабатывает открытие новых вкладок, pop-up окон или новых страниц после клика по ссылке?",
        "idealAnswerEn": "Use Promise.all([context.waitForEvent(\"page\"), page.click(\"a[target=_blank]\")]) to avoid race conditions. The waitForEvent promise resolves with the newly created Page instance, which can then be interacted with directly while keeping the original page accessible.",
        "idealAnswerUk": "Використовуйте зв'язку Promise.all([context.waitForEvent(\"page\"), page.click()]), щоб уникнути race conditions. Отримана сторінка є повноцінним об'єктом Page, з яким можна взаємодіяти паралельно з основною вкладкою.",
        "idealAnswerRu": "Используйте конструкцию Promise.all([context.waitForEvent(\"page\"), page.click()]), чтобы предотвратить гонку состояний. Метод возвращает новый объект Page для взаимодействия со второй вкладкой.",
        "keywords": [
                "waitForEvent",
                "popup",
                "new tab",
                "Promise.all",
                "race condition"
        ]
},
    {
        "id": 19,
        "roleLevel": "junior",
        "category": "File Upload & Download",
        "questionEn": "Explain how file uploads and file downloads are automated in Playwright without interacting with OS-native system dialogs.",
        "questionUk": "Поясніть, як у Playwright автоматизується завантаження файлів на сервер (upload) та збереження з сервера (download) без взаємодії з системними вікнами ОС.",
        "questionRu": "Объясните, как в Playwright автоматизируется загрузка файлов на сервер (upload) и скачивание (download) без работы с системными окнами ОС?",
        "idealAnswerEn": "For upload: locator.setInputFiles(\"path/to/file\"). For button-triggered file choosers: page.waitForEvent(\"filechooser\"). For downloads: wait for the download event with page.waitForEvent(\"download\"), then call await download.saveAs(\"target/path\"). This completely bypasses native OS file picker modals.",
        "idealAnswerUk": "Для upload використовують locator.setInputFiles() або подію filechooser. Для download очікують подію через page.waitForEvent(\"download\") та зберігають файл через download.saveAs(). Це працює на рівні браузера без звернення до нативних діалогів ОС.",
        "idealAnswerRu": "Для загрузки на сайт используется locator.setInputFiles() или событие filechooser. Для скачивания перехватывается событие download через page.waitForEvent(\"download\") с сохранением через saveAs().",
        "keywords": [
                "setInputFiles",
                "filechooser",
                "download",
                "saveAs",
                "OS dialogs"
        ]
},
    {
        "id": 20,
        "roleLevel": "junior",
        "category": "Dialogs & Alerts",
        "questionEn": "How does Playwright manage JavaScript alerts, confirms, and prompts, and what is its default behavior?",
        "questionUk": "Як Playwright взаємодіє з JS alert, confirm та prompt діалогами, і яка поведінка встановлена за замовчуванням?",
        "questionRu": "Как Playwright работает с JS alert, confirm и prompt диалогами, и какое поведение установлено по умолчанию?",
        "idealAnswerEn": "By default, Playwright automatically dismisses native JavaScript dialogs to prevent tests from hanging. To accept, verify the message, or provide prompt text, register a listener beforehand: page.on(\"dialog\", async dialog => { await dialog.accept(\"response\"); }).",
        "idealAnswerUk": "За замовчуванням Playwright автоматично відхиляє (dismiss) усі системні JS-діалоги, щоб тести не зависали. Щоб підтвердити або ввести текст, перед дією реєструють слухач: page.on(\"dialog\", async dialog => { await dialog.accept(); }).",
        "idealAnswerRu": "По умолчанию Playwright автоматически закрывает (dismiss) все всплывающие JS диалоги. Чтобы принять alert или ввести текст в prompt, до клика вешают обработчик page.on(\"dialog\", dialog => dialog.accept()).",
        "keywords": [
                "dialog",
                "alert",
                "confirm",
                "prompt",
                "dismiss",
                "accept",
                "page.on"
        ]
},
    {
        "id": 21,
        "roleLevel": "middle",
        "category": "Component Object Model",
        "questionEn": "When and why would you transition from Page Object Model (POM) to Component Object Model (COM) in large-scale frontend architectures?",
        "questionUk": "Коли та чому доцільно переходити від класичного Page Object Model (POM) до Component Object Model (COM) у великих проектах?",
        "questionRu": "Когда и почему целесообразно переходить от классического Page Object Model (POM) к Component Object Model (COM) в крупных проектах?",
        "idealAnswerEn": "Modern single-page applications (React, Vue, Next.js) consist of reusable widgets (Header, NavigationBar, DatePicker, Modal Dialogs, DataTables) that appear across dozens of pages. COM encapsulates each UI component into an isolated class accepting a root locator, preventing duplication across monolithic page classes.",
        "idealAnswerUk": "Сучасні веб-додатки будуються з повторюваних компонентів (модалки, хедери, таблиці, фільтри). COM інкапсулює кожен UI-компонент в окремий клас, який приймає кореневий локатор (root locator). Це запобігає дублюванню коду у великих монолітних Page Object класах.",
        "idealAnswerRu": "Современные SPA построены из переиспользуемых виджетов (модальные окна, таблицы, фильтры, хэдер). COM упаковывает каждый компонент в отдельный класс с root locator-ом, избегая дублирования методов по десяткам страниц.",
        "keywords": [
                "COM",
                "Component Object Model",
                "widgets",
                "reusable",
                "root locator",
                "SPA"
        ]
},
    {
        "id": 22,
        "roleLevel": "middle",
        "category": "Soft Assertions & Error Handling",
        "questionEn": "What are Soft Assertions in Playwright (expect.soft), and in what scenarios are they recommended vs hard assertions?",
        "questionUk": "Що таке Soft Assertions у Playwright (expect.soft), і в яких сценаріях їх рекомендовано використовувати замість звичайних hard assertions?",
        "questionRu": "Что такое Soft Assertions в Playwright (expect.soft), и в каких сценариях их рекомендуется использовать вместо обычных hard assertions?",
        "idealAnswerEn": "expect.soft() logs failure details without immediately aborting test execution. The test continues running and reports all accumulated failures at the end. Recommended for UI layout/content audits (e.g. validating 20 fields on a dashboard or profile) where you want to see all discrepancies at once.",
        "idealAnswerUk": "expect.soft() фіксує помилку, але не зупиняє виконання тесту негайно. Тест виконується до кінця і показує список усіх знайдених розбіжностей. Це ідеально для перевірки великих форм, профілів користувача чи таблиць даних.",
        "idealAnswerRu": "expect.soft() регистрирует падение проверки, но не прерывает выполнение теста. Идеально для валидации множества полей карточки, форм или дашборда, чтобы за один прогон увидеть все ошибки.",
        "keywords": [
                "expect.soft",
                "soft assertions",
                "abort",
                "continue",
                "audit",
                "validation"
        ]
},
    {
        "id": 23,
        "roleLevel": "middle",
        "category": "Device Emulation & Geolocation",
        "questionEn": "How do you emulate mobile devices, geolocation coordinates, and permissions in Playwright tests and fixtures?",
        "questionUk": "Як у тестах та фікстурах Playwright емулювати мобільні пристрої, геолокацію (GPS) та системні дозволи (permissions)?",
        "questionRu": "Как в тестах и фикстурах Playwright эмулировать мобильные устройства, геолокацию (GPS) и системные разрешения (permissions)?",
        "idealAnswerEn": "Use playwright.devices (e.g. devices[\"iPhone 14 Pro\"]) in playwright.config.ts or test.use(). For geolocation: test.use({ geolocation: { longitude: 48.8584, latitude: 2.2945 }, permissions: [\"geolocation\"] }). This configures the BrowserContext with simulated sensors without physical hardware.",
        "idealAnswerUk": "Використовуйте devices[\"iPhone 14\"] з playwright.devices у конфізі або test.use(). Для локації задають test.use({ geolocation: { latitude, longitude }, permissions: [\"geolocation\"] }). Це дає повну емуляцію сенсорів та розмірів екрану.",
        "idealAnswerRu": "Используйте предустановленные профили devices[\"Pixel 7\"] в test.use(). Геолокация и права задаются через свойства geolocation: { latitude, longitude } и permissions: [\"geolocation\"].",
        "keywords": [
                "devices",
                "geolocation",
                "permissions",
                "emulation",
                "mobile",
                "test.use"
        ]
},
    {
        "id": 24,
        "roleLevel": "middle",
        "category": "Data-Driven Testing",
        "questionEn": "How do you structure parameterized data-driven tests in Playwright, and how do you ensure clear test titles in reports?",
        "questionUk": "Як організувати параметризовані Data-Driven тести у Playwright та забезпечити інформативні заголовки у звітах?",
        "questionRu": "Как организовать параметризованные Data-Driven тесты в Playwright и обеспечить информативные заголовки в отчетах?",
        "idealAnswerEn": "Iterate over an array of test cases using standard JavaScript/TypeScript loops (e.g. testCases.forEach(({ role, expectedUrl }) => { test(\"Login as \" + role, async ({ page }) => { ... }) })). Ensure template literals in test titles create unique, descriptive entries in HTML reports.",
        "idealAnswerUk": "Використовують звичайний forEach по масиву тестових даних: testCases.forEach(({ role, target }) => { test(`Вхід як ${role}`, async ({ page }) => { ... }) }). Динамічні шаблонні рядки в назві гарантують унікальні кроки у звітах.",
        "idealAnswerRu": "Перебирайте массив сценариев циклом forEach: testCases.forEach(data => { test(`Тест ${data.name}`, async ({ page }) => { ... }) }). Динамические заголовки тестов гарантируют прозрачность отчета.",
        "keywords": [
                "data-driven",
                "parameterized",
                "forEach",
                "test titles",
                "reporting"
        ]
},
    {
        "id": 25,
        "roleLevel": "middle",
        "category": "WebSockets & Event Streams",
        "questionEn": "How does Playwright allow you to inspect or wait for WebSocket messages and Server-Sent Events (SSE)?",
        "questionUk": "Як Playwright дозволяє інспектувати або очікувати повідомлення WebSockets та Server-Sent Events (SSE)?",
        "questionRu": "Как Playwright позволяет перехватывать или ожидать сообщения WebSockets и Server-Sent Events (SSE)?",
        "idealAnswerEn": "Use page.waitForEvent(\"websocket\") or page.on(\"websocket\", ws => { ws.on(\"framereceived\", frame => ...); ws.on(\"framesent\", frame => ...); }). This allows asserting on real-time event payloads (chats, crypto tickers, push notifications) without relying on fragile UI polling.",
        "idealAnswerUk": "Через подію page.on(\"websocket\", ws => { ws.on(\"framereceived\", ...); }). Можна перевіряти вміст фреймів у реальному часі (чати, нотифікації, біржові курси) замість ненадійного очікування появи елементів на екрані.",
        "idealAnswerRu": "Через подписку page.on(\"websocket\", ws => { ws.on(\"framereceived\", frame => ...); }). Это позволяет верифицировать полезную нагрузку сообщений чата, котировок или push-уведомлений напрямую.",
        "keywords": [
                "websocket",
                "framereceived",
                "SSE",
                "real-time",
                "events"
        ]
},
    {
        "id": 26,
        "roleLevel": "senior",
        "category": "Test Data Management & Factories",
        "questionEn": "Compare Synthetic Test Data Generation (Factories/APIs) vs Pre-seeded Database Dumps in enterprise CI/CD. Which architecture scales better?",
        "questionUk": "Порівняйте генерацію синтетичних тестових даних на льоту (Factories/APIs) та дампи передзаповненої бази даних у корпоративному CI/CD. Який підхід краще масштабується?",
        "questionRu": "Сравните динамическую генерацию тестовых данных (Factories/APIs) и дамп базы данных в enterprise CI/CD. Какой подход лучше масштабируется?",
        "idealAnswerEn": "Pre-seeded DB dumps suffer from test pollution, maintenance overhead on schema changes, and race conditions during parallel shard execution. Dynamic API factories (e.g. creating isolated users/organizations per test via REST API or test data fixtures) guarantee 100% test autonomy, zero state collisions, and instant compatibility with parallel CI runners.",
        "idealAnswerUk": "Дампи БД страждають від взаємного впливу тестів (test pollution), конфліктів при паралельних раннерах і потреби постійного оновлення схеми. Динамічні фабрики через API генерують унікальні сутності під кожен тест, гарантуючи повну автономність та безшовне масштабування в CI.",
        "idealAnswerRu": "Дампы БД приводят к коллизиям данных при параллельных воркерах и устаревают при миграциях. API фабрики генерируют изолированные уникальные сущности под каждый тест за миллисекунды, гарантируя 100% независимость тестов.",
        "keywords": [
                "test data",
                "factories",
                "isolation",
                "pollution",
                "parallel CI",
                "scalability"
        ]
},
    {
        "id": 27,
        "roleLevel": "senior",
        "category": "Performance & Core Web Vitals",
        "questionEn": "How can you measure Core Web Vitals (LCP, CLS, FID/INP) and network waterfalls during Playwright execution?",
        "questionUk": "Як вимірювати показники Core Web Vitals (LCP, CLS, INP) та аналізувати таймінги мережі в Playwright?",
        "questionRu": "Как измерять метрики производительности Core Web Vitals (LCP, CLS, INP) и сетевой таймлайн в Playwright?",
        "idealAnswerEn": "Access Chrome DevTools Protocol via page.context().newCDPSession(page) to capture Performance Metrics, or execute window.performance.getEntriesByType(\"navigation\") and PerformanceObserver directly in page.evaluate(). This allows setting automated performance budgets in CI to block releases if bundle size or page load degrades.",
        "idealAnswerUk": "Через прямий сеанс Chrome DevTools Protocol (CDPSession) або виконання PerformanceObserver у браузері через page.evaluate(). Це дозволяє автоматично контролювати Performance Budgets у CI і фейлити білд, якщо LCP або час завантаження сторінки перевищив ліміт.",
        "idealAnswerRu": "С помощью CDPSession (Chrome DevTools Protocol) или через PerformanceObserver в page.evaluate(). Это дает возможность внедрить Performance Budgets в CI и блокировать деградацию скорости страниц.",
        "keywords": [
                "Core Web Vitals",
                "CDPSession",
                "PerformanceObserver",
                "LCP",
                "CLS",
                "performance budgets"
        ]
},
    {
        "id": 28,
        "roleLevel": "senior",
        "category": "Security Testing in E2E",
        "questionEn": "How can you integrate automated security checks (detecting CSP violations, insecure cookies, mixed content) into your Playwright test runs?",
        "questionUk": "Як інтегрувати базові автоматизовані перевірки безпеки (CSP-порушення, відсутність HttpOnly/Secure у cookies, mixed content) у набір тестів Playwright?",
        "questionRu": "Как интегрировать автоматические проверки безопасности (CSP нарушения, флаги cookies HttpOnly/Secure, mixed content) в наборы тестов Playwright?",
        "idealAnswerEn": "Listen to page.on(\"console\") and page.on(\"requestfailed\") to catch Content Security Policy (CSP) errors and mixed-content warnings. Inspect context.cookies() to assert that session identifiers strictly enforce Secure, HttpOnly, and SameSite=Strict attributes.",
        "idealAnswerUk": "Підписатися на page.on(\"console\") та page.on(\"requestfailed\") для перехоплення CSP-помилок та змішаного контенту (HTTP на HTTPS). Перевіряти cookies сесії через context.cookies(), контролюючи обов'язковість прапорців HttpOnly, Secure та SameSite.",
        "idealAnswerRu": "Слушать события page.on(\"console\") для отлова предупреждений CSP и Mixed Content. Проверять контекстные cookies через context.cookies() на обязательное наличие атрибутов HttpOnly, Secure и SameSite.",
        "keywords": [
                "security",
                "CSP",
                "cookies",
                "HttpOnly",
                "SameSite",
                "mixed content"
        ]
},
    {
        "id": 29,
        "roleLevel": "senior",
        "category": "Test Governance & ROI Metrics",
        "questionEn": "Which KPIs and metrics do you track as a Lead QA Automation Engineer to prove testing ROI and pipeline health to management?",
        "questionUk": "Які KPI та інженерні метрики ви відстежуєте як Lead QA Automation, щоб доводити керівництву ROI автоматизації та здоров'я пайплайнів?",
        "questionRu": "Какие KPI и инженерные метрики вы отслеживаете как Lead QA Automation, чтобы демонстрировать руководству ROI автоматизации и качество пайплайнов?",
        "idealAnswerEn": "1. Test Execution Time (P95 run duration under 10m). 2. Flakiness Rate (< 1% retry occurrence). 3. Defect Escape Rate (bugs caught in Prod vs in CI). 4. Pipeline Reliability (CI pass-rate on master > 98%). 5. Automation Coverage on critical business journeys. 6. Time to Feedback (MTTR on broken builds).",
        "idealAnswerUk": "1. Тривалість запуску пайплайну (P95 < 10 хв). 2. Рівень нестабільності (Flakiness rate < 1%). 3. Відсоток витоку дефектів (Defect Escape Rate у прод). 4. Стабільність збірок (CI pass rate > 98%). 5. Покриття критичних бізнес-сценаріїв (Customer Journeys). 6. Швидкість зворотного зв'язку для розробників.",
        "idealAnswerRu": "1. Время прогона тестов в CI (P95 < 10 мин). 2. Процент flakiness тестов (< 1%). 3. Defect Escape Rate (пропуск багов в прод). 4. Проходимость мастер-веток (> 98%). 5. Покрытие ключевых бизнес-путей. 6. Время получения фидбека разработчиками.",
        "keywords": [
                "KPI",
                "ROI",
                "Defect Escape Rate",
                "Flakiness Rate",
                "P95",
                "pass rate"
        ]
},
    {
        "id": 30,
        "roleLevel": "senior",
        "category": "Selenium to Playwright Migration",
        "questionEn": "How do you architect a seamless, low-risk migration strategy of a 2,000+ test Selenium/Java or Cypress suite to Playwright/TypeScript?",
        "questionUk": "Як спроєктувати безболісну низькоризикову стратегію міграції 2000+ тестів із Selenium/Java або Cypress на Playwright/TypeScript?",
        "questionRu": "Как спроектировать стратегию бесшовной и надежной миграции набора из 2000+ тестов с Selenium/Java или Cypress на Playwright/TypeScript?",
        "idealAnswerEn": "1. Strangler Fig pattern: freeze new Selenium tests; write all new features in Playwright. 2. Build core Playwright framework (auth fixtures, custom locators, reporters). 3. Migrate smoke and high-frequency happy paths first to demonstrate immediate CI speedup (from 45m to 6m). 4. Run parallel suites in CI temporarily. 5. Sunset legacy suite incrementally without blocking feature delivery.",
        "idealAnswerUk": "1. Патерн Strangler Fig: нові тести пишуться тільки на Playwright. 2. Створення базового ядра фреймворку (fixtures, авто-авторизація, звіти). 3. Першочергова міграція Smoke-набору для демонстрації миттєвого прискорення CI (з 45 до 6 хв). 4. Тимчасовий паралельний запуск у CI для валідації. 5. Поетапне відключення старого коду без зупинки релізів.",
        "idealAnswerRu": "1. Паттерн Strangler Fig: новые тесты только на Playwright. 2. Создание фундаментального ядра (фикстуры, storageState, репортеры). 3. Первоочередной перенос Smoke тестов для наглядной демонстрации ускорения CI. 4. Параллельный запуск на переходном этапе. 5. Пошаговый вывод легаси из эксплуатации.",
        "keywords": [
                "migration",
                "Strangler Fig",
                "Selenium",
                "Cypress",
                "smoke suite",
                "ROI",
                "speedup"
        ]
}
]

export function getQuestionsForLevel(level: 'junior' | 'middle' | 'senior', count: number = 5): CuratedQuestion[] {
    const list = INTERVIEW_QUESTIONS_BANK.filter(q => q.roleLevel === level)
    // Shuffle and pick `count` questions
    const shuffled = [...list].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}
