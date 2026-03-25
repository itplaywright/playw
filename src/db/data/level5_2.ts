export const level5Tasks_2 = [
    {
        title: "5.6 Downloads: Перехоплення завантажених файлів",
        description: `## 📥 Тестування завантаження файлів (Export to CSV/PDF)

Коли юзер клікає "Завантажити звіт", браузер зберігає файл на диск. У автоматизованих тестах ми не знаємо, куди саме він збережеться (залежить від ОС та налаштувань CI).

Playwright дозволяє "перехопити" цей файл прямо в оперативну пам'ять, зберегти куди нам треба, і навіть прочитати його вміст!

## 🛠 Концепція на практиці
Синтаксис дуже схожий на роботу з новими вкладками (\`Promise.all\`).

\`\`\`typescript
import * as fs from 'fs';

test('Експорт звіту в CSV', async ({ page }) => {\n
  // 1. Паралельно чекаємо подію download і клікаємо
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Експорт у CSV' }).click()
  ]);

  // 2. Валідація імені файлу
  expect(download.suggestedFilename()).toBe('report-2024.csv');

  // 3. Зберігаємо файл у тимчасову папку
  const path = './downloads/test-report.csv';
  await download.saveAs(path);

  // 4. (Опціонально) Читаємо файл і перевіряємо вміст
  const fileContent = fs.readFileSync(path, 'utf8');
  expect(fileContent).toContain('User,Email,Role'); // Перевірка CSV header
});
\`\`\`

---
### 🎯 Ваше завдання
Яка команда правильна для того, щоб врівноважити і клік, і очікування старту завантаження файлу?
`,
        code: "test('download', async ({ page }) => {\n  const [download] = await Promise.all([\n    /* Який метод чекає на старт завантаження? */,\n    page.click('#download-btn')\n  ]);\n});",
        type: "quiz",
        options: [
            "page.waitForEvent('download')",
            "page.on('download')",
            "page.getDownload()",
            "browser.waitForDownload()"
        ],
        correctAnswer: "page.waitForEvent('download')"
    },
    {
        title: "5.7 Uploads: Відправка файлів через <input type='file'>",
        description: `## 📤 Тестування завантаження аватарів та документів

Ваша програма вимагає завантаження PDF-документу. У реальному житті юзер викликає діалогове вікно Windows/Mac. Тести не можуть (і не повинні) взаємодіяти з вікнами ОС!

**Playwright обходить це обмеження**: він програмно передає шлях до файлу безпосередньо у DOM-елемент \`<input type="file">\`.

## 🛠 Концепція на практиці
\`\`\`typescript
import * as path from 'path';

test('Завантаження аватару користувача', async ({ page }) => {
  await page.goto('/profile');
  
  // Шлях до тестового фотки лежить у папці з тестами
  const fileToUpload = path.join(__dirname, '../test-data/avatar.png');

  // Якщо інпут ВИДИМИЙ:
  await page.locator('input[type="file"]').setInputFiles(fileToUpload);
  
  // Скинути (видалити) файл:
  // await page.locator('input[type="file"]').setInputFiles([]);

  await page.getByRole('button', { name: 'Зберегти' }).click();
  await expect(page.locator('.toast-success')).toBeVisible();
});
\`\`\`

💡 **Хитрий випадок**: Якщо \`<input type="file">\` прихований (наприклад, \`display: none\`, а юзер клікає по красивій кнопці-обгортці), метод \`setInputFiles()\` все одно спрацює! Але якщо елемент створено динамічно в пам'яті (без інпуту в DOM), використовуйте \`page.waitForEvent('filechooser')\`.

---
### 🎯 Ваше завдання
Який метод Playwright використовується для прямого додавання файлу до \`<input type="file">\`?
`,
        code: "test('upload file', async ({ page }) => {\n  const filePath = './assets/doc.pdf';\n  // Завантажте файл у прихований input\n  await page.locator('input[type=file]')./* ? */(filePath);\n});",
        type: "quiz",
        options: [
            "setInputFiles()",
            "upload()",
            "attachFile()",
            "sendFiles()"
        ],
        correctAnswer: "setInputFiles()"
    },
    {
        title: "5.8 iframes: Взаємодія з вбудованими віджетами (Stripe / YouTube)",
        description: `## 🖼️ iFrames: Як зламати сліпу зону локаторів

**Проблема**: Ваш сайт містить віджет оплати від Stripe. Цей віджет — це старий добрий \`<iframe>\`.
Якщо ви спробуєте знайти поле "Card Number" через \`page.locator('#card')\`, тест впаде. ` + "`page`" + ` "не бачить" те, що всередині iframe. Це інша сторінка всередині вашої сторінки.

**Рішення**: \`frameLocator()\`. Ви спочатку знаходите "каркас" iframe, а потім заходите "всередину".

## 🛠 Концепція на практиці
\`\`\`typescript
test('Оплата через Stripe iframe', async ({ page }) => {
  await page.goto('/checkout');
  
  // 1. Знаходимо сам iframe (наприклад, за id або title)
  // frameLocator замість звичайного locator!
  const stripeFrame = page.frameLocator('#stripe-checkout');
  
  // 2. Звертаємось до елементів ВСЕРЕДИНІ iframe
  await stripeFrame.locator('[name="cardnumber"]').fill('4242 4242 4242 4242');
  await stripeFrame.locator('[name="exp-date"]').fill('12/25');
  await stripeFrame.locator('[name="cvc"]').fill('123');
  
  // 3. Звертаємосю до кнопки на ОСНОВНІЙ сторінці
  await page.getByRole('button', { name: 'Submit Payment' }).click();
});
\`\`\`

---
### 🎯 Ваше завдання
Який метод потрібно застосувати до об'єкта \`page\`, щоб перейти в контекст iframe і шукати елементи там?
`,
        code: "test('iframe data', async ({ page }) => {\n  // Треба знайти кнопку 'Play' всередині YouTube iframe\n  await page./* ? */('iframe[src*=\"youtube\"]').getByLabel('Play').click();\n});",
        type: "quiz",
        options: [
            "frameLocator()",
            "locator().frame()",
            "switchToFrame()",
            "getFrame()"
        ],
        correctAnswer: "frameLocator()"
    },
    {
        title: "5.9 Dialogs: Обробка Alerts та Confirmation вікон",
        description: `## 🗨️ Системні діалоги: Alert, Confirm, Prompt

Іноді розробники використовують нативні браузерні вікна, викликані через \`window.alert('Успіх!')\` або \`window.confirm('Видалити?')\`.

**Поведінка Playwright за замовчуванням**: Він АВТОМАТИЧНО закриває (\`dismiss\`) усі такі діалогові вікна миттєво!
Тому, якщо ви просто клікнете "Видалити", а Playwright скасує діалог, ваш тест провалиться, бо елемент не буде видалений.

**Рішення**: Попередньо підписатися на подію \`dialog\` і змінити поведінку.

## 🛠 Концепція на практиці
\`\`\`typescript
test('Обробка вікна підтвердження видалення', async ({ page }) => {
  await page.goto('/admin');
  
  // 1. ПІДПИСУЄМОСЬ на появу діалогу (обов'язково ПЕРЕД кліком!)
  page.once('dialog', async dialog => {
    // Перевіряємо текст діалогу
    expect(dialog.message()).toBe('Ви впевнені, що хочете видалити цей запис?');
    expect(dialog.type()).toBe('confirm');
    
    // Погоджуємось (тиснемо "OK")
    await dialog.accept(); 
    
    // Або відхиляємо: await dialog.dismiss();
  });

  // 2. СПРОВОКУВАТИ ПОЯВУ ДІАЛОГУ
  await page.getByRole('button', { name: 'Видалити профіль' }).click();
  
  // 3. Перевірити, що профіль справді худий
  await expect(page.getByText('Профіль успішно видалено')).toBeVisible();
});
\`\`\`

---
### 🎯 Ваше завдання
Як у Playwright прийняти (натиснути OK) системний \`window.confirm()\`, який з'являється на сторінці?
`,
        code: "test('dialog handle', async ({ page }) => {\n  // Як прийняти діалог?\n  page.on('dialog', dialog => /* ваш код тут */);\n  await page.click('#delete-user');\n});",
        type: "quiz",
        options: [
            "dialog.accept()",
            "dialog.ok()",
            "dialog.confirm()",
            "page.acceptAlert()"
        ],
        correctAnswer: "dialog.accept()"
    },
    {
        title: "5.10 Visual Regression: Порівняння скріншотів",
        description: `## 📸 Візуальне тестування (Pixel-to-Pixel)

Unit-тести перевіряють логіку. E2E-тести перевіряють потік даних.
Але хто перевірить, що кнопка не "з'їхала" на 10 пікселів вліво, або що шрифт не став яскраво-рожевим через чиюсь помилку в CSS?

Для цього є **Visual Regression Testing**. Playwright робить скріншот екрану (або компонента) і порівнює його з еталонним (\`golden\`) зображенням попіксельно.

## 🛠 Концепція на практиці
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('Герой-банер домашньої сторінки виглядає правильно', async ({ page }) => {
  await page.goto('/home');
  
  // Перший запуск: тесту немає з чим порівнювати. 
  // Він впаде, але ЗБЕРЕЖЕ еталонне фото в папці з тестами
  
  // Всі наступні запуски: Playwright робитиме нове фото і порівнюватиме з існуючим
  await expect(page).toHaveScreenshot('home-banner.png');
});

test('Перевірка конкретного компонента (кнопки)', async ({ page }) => {
  await page.goto('/components');
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  
  // Можна робити скріншот конкретного елемента, екрануючи решту сайту!
  await expect(submitBtn).toHaveScreenshot('submit-button-state.png');
});
\`\`\`
💡 **Команда для оновлення скріншотів**: Якщо ви навмисно змінили дизайн, запустіть тести з прапорцем:
\`npx playwright test --update-snapshots\`

---
### 🎯 Ваше завдання
Який матчер \`expect\` використовується у Playwright для візуального порівняння зображень (попіксельної перевірки скріншотів)?
`,
        code: "test('visual check', async ({ page }) => {\n  await page.goto('/');\n  // Який матчер зробить скріншот і порівняє його зі зразком?\n  await expect(page)./* ? */;\n});",
        type: "quiz",
        options: [
            "toHaveScreenshot()",
            "toMatchScreenshot()",
            "toBeSameAsSnapshot()",
            "compareScreenshot()"
        ],
        correctAnswer: "toHaveScreenshot()"
    }
];
