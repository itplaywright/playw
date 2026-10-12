require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const remainingTasks = [
    {
        id: 1056,
        titleEn: "Arrow Functions (lambda)",
        titleRu: "Стрелочные функции",
        descriptionUk: `## 🏹 Стрілочні функції (Arrow Functions)

**Теорія**
У сучасному JavaScript та TypeScript стрілочні функції (\`() => {}\`) є основним стандартом для написання лаконічного та читабельного коду. В автоматизації тестування Playwright вони використовуються повсюдно: у визначенні тестових блоків \`test('name', async ({ page }) => { ... })\`, колбеках фільтрації елементів, очікуваннях \`toPass()\` та мапінгу тестових даних.

**Приклад**
\`\`\`typescript
// Звичайна функція
function getLocator(name: string) {
    return \`button[name="\${name}"]\`;
}

// Стрілочна функція (більш компактна)
const getLocatorArrow = (name: string): string => \`button[name="\${name}"]\`;
\`\`\`

### Завдання
Створіть стрілочну функцію \`formatUserSelector\`, яка приймає рядок \`username\` і повертає селектор \`[data-user="\${username}"]\`.`,
        descriptionEn: `## 🏹 Arrow Functions

**Theory**
In modern TypeScript and JavaScript, arrow functions (\`() => {}\`) are the standard for writing concise and clean code. In Playwright test automation, you encounter them everywhere: defining test blocks \`test('title', async ({ page }) => { ... })\`, filter callbacks for page elements, \`toPass()\` assertions, and mapping test data.

**Example**
\`\`\`typescript
// Regular function
function getLocator(name: string) {
    return \`button[name="\${name}"]\`;
}

// Arrow function (concise)
const getLocatorArrow = (name: string): string => \`button[name="\${name}"]\`;
\`\`\`

### Task
Create an arrow function \`formatUserSelector\` that takes a \`username\` string and returns the locator \`[data-user="\${username}"]\`.`,
        descriptionRu: `## 🏹 Стрелочные функции (Arrow Functions)

**Теория**
В современном TypeScript и JavaScript стрелочные функции (\`() => {}\`) являются стандартом для написания чистого и краткого кода. В автоматизации Playwright они встречаются повсеместно: объявление тестов \`test('title', async ({ page }) => { ... })\`, фильтрация элементов, assertions \`toPass()\` и обработка тестовых данных.

**Пример**
\`\`\`typescript
// Обычная функция
function getLocator(name: string) {
    return \`button[name="\${name}"]\`;
}

// Стрелочная функция (компактная)
const getLocatorArrow = (name: string): string => \`button[name="\${name}"]\`;
\`\`\`

### Задание
Создайте стрелочную функцию \`formatUserSelector\`, которая принимает строку \`username\` и возвращает селектор \`[data-user="\${username}"]\`.`,
        initialCodeUk: `// TODO: 1. Оголосіть стрілочну функцію formatUserSelector
// Вона повинна приймати username: string та повертати селектор вида [data-user="..."]

export const formatUserSelector = (username: string): string => {
    /* Впишіть повернення шаблонного рядка сюди */
    return \`[data-user="\${username}"]\`;
};
`,
        initialCodeEn: `// TODO: 1. Declare the arrow function formatUserSelector
// It should accept username: string and return selector like [data-user="..."]

export const formatUserSelector = (username: string): string => {
    /* Insert template string return here */
    return \`[data-user="\${username}"]\`;
};
`,
        initialCodeRu: `// TODO: 1. Объявите стрелочную функцию formatUserSelector
// Она должна принимать username: string и возвращать селектор вида [data-user="..."]

export const formatUserSelector = (username: string): string => {
    /* Впишите возврат шаблонной строки сюда */
    return \`[data-user="\${username}"]\`;
};
`
    },
    {
        id: 1057,
        titleEn: "Optional Chaining (?.)",
        titleRu: "Опциональная цепочка (?.)",
        descriptionUk: `## 🔗 Опційне ланцюгування (Optional Chaining)

**Теорія**
Оператор \`?.\` дозволяє безпечно зчитувати значення вкладених властивостей об'єкта без ризику отримати фатальну помилку \`Cannot read properties of undefined\`. В автоматизації тестування Playwright ми часто парсимо складні JSON-відповіді бекенду або об'єкти налаштувань, де деякі поля можуть бути відсутніми.

**Приклад**
\`\`\`typescript
const response = { data: { user: { profile: { email: "qa@test.com" } } } };
const email = response?.data?.user?.profile?.email; // Безпечно!
const phone = response?.data?.user?.contacts?.phone; // undefined (без падіння тесту)
\`\`\`

### Завдання
Отримайте статус замовлення через опційне ланцюгування \`apiResponse?.order?.status\`, щоб запобігти падінню тесту, якщо об'єкт замовлення порожній.`,
        descriptionEn: `## 🔗 Optional Chaining (?.)

**Theory**
The \`?.\` operator allows safe navigation through nested properties without throwing \`TypeError: Cannot read properties of undefined\`. In Playwright automation, we constantly inspect complex API responses and configuration objects where optional fields may be omitted.

**Example**
\`\`\`typescript
const response = { data: { user: { profile: { email: "qa@test.com" } } } };
const email = response?.data?.user?.profile?.email; // Safe!
const phone = response?.data?.user?.contacts?.phone; // undefined (no crash)
\`\`\`

### Task
Safely access order status using optional chaining: \`apiResponse?.order?.status\`.`,
        descriptionRu: `## 🔗 Опциональная цепочка вызовов (?.)

**Теория**
Оператор \`?.\` позволяет безопасно обращаться к свойствам вложенных объектов без риска падения теста с ошибкой \`Cannot read properties of undefined\`. В тестах Playwright мы часто парсим JSON API, где некоторые параметры могут отсутствовать.

**Пример**
\`\`\`typescript
const response = { data: { user: { profile: { email: "qa@test.com" } } } };
const email = response?.data?.user?.profile?.email; // Безопасно!
const phone = response?.data?.user?.contacts?.phone; // undefined (без падения теста)
\`\`\`

### Задание
Безопасно извлеките статус заказа через опциональную цепочку \`apiResponse?.order?.status\`.`,
        initialCodeUk: `interface ApiResponse {
    order?: {
        id: number;
        status?: string;
    };
}

export function getOrderStatus(res: ApiResponse | null | undefined): string {
    // TODO: 1. Використайте опційне ланцюгування для отримання status
    // Якщо статус відсутній, поверніть дефолтне значення 'unknown'
    return res?.order?.status ?? 'unknown';
}
`,
        initialCodeEn: `interface ApiResponse {
    order?: {
        id: number;
        status?: string;
    };
}

export function getOrderStatus(res: ApiResponse | null | undefined): string {
    // TODO: 1. Use optional chaining to access status
    // If status is not found, fallback to 'unknown'
    return res?.order?.status ?? 'unknown';
}
`,
        initialCodeRu: `interface ApiResponse {
    order?: {
        id: number;
        status?: string;
    };
}

export function getOrderStatus(res: ApiResponse | null | undefined): string {
    // TODO: 1. Используйте опциональную цепочку для получения status
    // Если статус отсутствует, верните значение 'unknown'
    return res?.order?.status ?? 'unknown';
}
`
    },
    {
        id: 1058,
        titleEn: "Error Handling: try / catch",
        titleRu: "Обработка ошибок: try / catch",
        descriptionUk: `## 🛡️ Обробка помилок: try / catch

**Теорія**
Конструкція \`try / catch\` дозволяє перехоплювати та коректно обробляти помилки виконання. В автотестах це необхідно при роботі з нестабільними зовнішніми ресурсами: парсингу JSON, виконанні складних розрахунків або додатковому збереженні артефактів/скріншотів при невдалому кроці тесту.

**Приклад**
\`\`\`typescript
try {
    const data = JSON.parse(rawResponse);
    return data;
} catch (error) {
    console.warn("Помилка парсингу відповіді сервера:", error);
    return null;
}
\`\`\`

### Завдання
Огорніть парсинг рядка JSON у блок \`try / catch\`, повертаючи \`null\` у разі невалідного формату.`,
        descriptionEn: `## 🛡️ Error Handling: try / catch

**Theory**
The \`try / catch\` block allows catching and gracefully handling runtime errors. In automation testing, it is critical when parsing incoming JSON data, reading files, or capturing diagnostics and screenshots when an operation fails.

**Example**
\`\`\`typescript
try {
    const data = JSON.parse(rawResponse);
    return data;
} catch (error) {
    console.warn("Failed to parse server response:", error);
    return null;
}
\`\`\`

### Task
Wrap the JSON string parsing into a \`try / catch\` block, returning \`null\` on syntax errors.`,
        descriptionRu: `## 🛡️ Обработка ошибок: try / catch

**Теория**
Блок \`try / catch\` позволяет перехватывать и корректно обрабатывать исключения. В автотестах Playwright это важно для парсинга ответов API, чтения файлов и сохранения артефактов при сбое.

**Пример**
\`\`\`typescript
try {
    const data = JSON.parse(rawResponse);
    return data;
} catch (error) {
    console.warn("Ошибка парсинга:", error);
    return null;
}
\`\`\`

### Задание
Оберните парсинг JSON в блок \`try / catch\`, возвращая \`null\` при ошибке.`,
        initialCodeUk: `export function parseTestData(jsonString: string): any {
    // TODO: 1. Додайте блок try / catch
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        // TODO: 2. Поверніть null, якщо JSON пошкоджений
        return null;
    }
}
`,
        initialCodeEn: `export function parseTestData(jsonString: string): any {
    // TODO: 1. Add try / catch block
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        // TODO: 2. Return null if JSON is invalid
        return null;
    }
}
`,
        initialCodeRu: `export function parseTestData(jsonString: string): any {
    // TODO: 1. Добавьте блок try / catch
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        // TODO: 2. Верните null, если JSON некорректен
        return null;
    }
}
`
    },
    {
        id: 1059,
        titleEn: "Modules & Imports (import / export)",
        titleRu: "Модули и импорты (import / export)",
        descriptionUk: `## 📦 Модулі та імпорти: import & export

**Теорія**
Організація коду на окремі модулі — це фундамент патерну Page Object Model (POM) в автоматизації. Ми виносимо локатори, сторінки та хелпери в окремі файли через \`export\`, а в тестових файлах підключаємо їх за допомогою \`import\`.

**Приклад**
\`\`\`typescript
// helpers/auth.ts
export const loginUrl = "https://app.test/login";
export function makeToken() { return "test-token"; }

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { loginUrl, makeToken } from '../helpers/auth';
\`\`\`

### Завдання
Експортуйте інтерфейс конфігурації \`TestConfig\` та дефолтний об'єкт налаштувань для тестового середовища.`,
        descriptionEn: `## 📦 Modules & Imports (import / export)

**Theory**
Modular architecture is the cornerstone of the Page Object Model (POM) in test automation. We isolate locators, helpers, and page classes with \`export\`, and load them into test suites with \`import\`.

**Example**
\`\`\`typescript
// helpers/auth.ts
export const loginUrl = "https://app.test/login";
export function makeToken() { return "test-token"; }

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { loginUrl, makeToken } from '../helpers/auth';
\`\`\`

### Task
Export the configuration interface \`TestConfig\` and the default configuration object for the test environment.`,
        descriptionRu: `## 📦 Модули и импорты: import & export

**Теория**
Модульность — основа архитектуры Page Object Model (POM) в автотестах. Мы выносим страницы, локаторы и утилиты с помощью \`export\` и подключаем их через \`import\`.

**Пример**
\`\`\`typescript
// helpers/auth.ts
export const loginUrl = "https://app.test/login";
export function makeToken() { return "test-token"; }

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { loginUrl, makeToken } from '../helpers/auth';
\`\`\`

### Задание
Экспортируйте интерфейс конфигурации \`TestConfig\` и объект настроек тестового окружения.`,
        initialCodeUk: `// TODO: 1. Експортуйте інтерфейс конфігурації
export interface TestConfig {
    baseUrl: string;
    timeout: number;
    headless: boolean;
}

// TODO: 2. Експортуйте константу defaultConfig з налаштуваннями
export const defaultConfig: TestConfig = {
    baseUrl: "https://example.com",
    timeout: 30000,
    headless: true
};
`,
        initialCodeEn: `// TODO: 1. Export the configuration interface
export interface TestConfig {
    baseUrl: string;
    timeout: number;
    headless: boolean;
}

// TODO: 2. Export the defaultConfig constant
export const defaultConfig: TestConfig = {
    baseUrl: "https://example.com",
    timeout: 30000,
    headless: true
};
`,
        initialCodeRu: `// TODO: 1. Экспортируйте интерфейс конфигурации
export interface TestConfig {
    baseUrl: string;
    timeout: number;
    headless: boolean;
}

// TODO: 2. Экспортируйте константу defaultConfig
export const defaultConfig: TestConfig = {
    baseUrl: "https://example.com",
    timeout: 30000,
    headless: true
};
`
    }
];

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Updating remaining tasks for Track 72...");
        for (const t of remainingTasks) {
            await conn.query(
                `UPDATE tasks SET 
                    title_en = ?,
                    title_ru = ?,
                    description = ?,
                    description_en = ?,
                    description_ru = ?,
                    initial_code = ?,
                    initial_code_en = ?,
                    initial_code_ru = ?
                WHERE id = ?`,
                [
                    t.titleEn,
                    t.titleRu,
                    t.descriptionUk,
                    t.descriptionEn,
                    t.descriptionRu,
                    t.initialCodeUk,
                    t.initialCodeEn,
                    t.initialCodeRu,
                    t.id
                ]
            );
            console.log(`✓ Updated task #${t.id}: ${t.titleEn}`);
        }
        console.log("Track 72 is 100% complete!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
