require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const questionsData = [
  {
    taskId: 1025,
    uk: {
      text: "Яке ключове слово слід використовувати для створення змінної, значення якої ми НЕ плануємо змінювати в майбутньому?",
      options: ["const", "let", "var", "fixed"],
      correct: "const"
    },
    en: {
      text: "Which keyword should be used to create a variable that we do NOT plan to change in the future?",
      options: ["const", "let", "var", "fixed"],
      correct: "const"
    },
    ru: {
      text: "Какое ключевое слово следует использовать для создания переменной, значение которой мы НЕ планируем изменять в будущем?",
      options: ["const", "let", "var", "fixed"],
      correct: "const"
    }
  },
  {
    taskId: 1026,
    uk: {
      text: "Який тип даних має лише два значення: true та false?",
      options: ["boolean", "string", "number", "object"],
      correct: "boolean"
    },
    en: {
      text: "Which data type has only two values: true and false?",
      options: ["boolean", "string", "number", "object"],
      correct: "boolean"
    },
    ru: {
      text: "Какой тип данных имеет только два значения: true и false?",
      options: ["boolean", "string", "number", "object"],
      correct: "boolean"
    }
  },
  {
    taskId: 1027,
    uk: {
      text: "Яке ключове слово використовується перед асинхронними діями у Playwright для очікування результату?",
      options: ["await", "async", "wait", "delay"],
      correct: "await"
    },
    en: {
      text: "Which keyword is used before asynchronous actions in Playwright to wait for the result?",
      options: ["await", "async", "wait", "delay"],
      correct: "await"
    },
    ru: {
      text: "Какое ключевое слово используется перед асинхронными действиями в Playwright для ожидания результата?",
      options: ["await", "async", "wait", "delay"],
      correct: "await"
    }
  },
  {
    taskId: 1028,
    uk: {
      text: "Яке ключове слово робить функцію асинхронною та дозволяє використовувати await всередині?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    },
    en: {
      text: "Which keyword makes a function asynchronous and allows using await inside?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    },
    ru: {
      text: "Какое ключевое слово делает функцию асинхронной и позволяет использовать await внутри?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    }
  },
  {
    taskId: 1029,
    uk: {
      text: "Яка конструкція витягне властивість page з об'єкта data за допомогою деструктуризації?",
      options: ["const { page } = data;", "const [ page ] = data;", "const page = data(page);", "extract page from data;"],
      correct: "const { page } = data;"
    },
    en: {
      text: "Which syntax extracts the page property from the data object using destructuring?",
      options: ["const { page } = data;", "const [ page ] = data;", "const page = data(page);", "extract page from data;"],
      correct: "const { page } = data;"
    },
    ru: {
      text: "Какая конструкция извлечет свойство page из объекта data с помощью деструктуризации?",
      options: ["const { page } = data;", "const [ page ] = data;", "const page = data(page);", "extract page from data;"],
      correct: "const { page } = data;"
    }
  },
  {
    taskId: 1030,
    uk: {
      text: "Яка правильна базова структура тесту в Playwright?",
      options: ["test('login test', async ({ page }) => { })", "it('login test', async () => { })", "describe('login test', () => { })", "test('login test', function(page) { })"],
      correct: "test('login test', async ({ page }) => { })"
    },
    en: {
      text: "What is the correct basic test structure in Playwright?",
      options: ["test('login test', async ({ page }) => { })", "it('login test', async () => { })", "describe('login test', () => { })", "test('login test', function(page) { })"],
      correct: "test('login test', async ({ page }) => { })"
    },
    ru: {
      text: "Какова правильная базовая структура теста в Playwright?",
      options: ["test('login test', async ({ page }) => { })", "it('login test', async () => { })", "describe('login test', () => { })", "test('login test', function(page) { })"],
      correct: "test('login test', async ({ page }) => { })"
    }
  },
  {
    taskId: 1031,
    uk: {
      text: "Яка команда Playwright використовується для переходу за вказаною URL-адресою?",
      options: ["await page.goto('https://finmore.netlify.app/')", "await page.open('https://finmore.netlify.app/')", "await page.navigate('https://finmore.netlify.app/')", "await browser.goto('https://finmore.netlify.app/')"],
      correct: "await page.goto('https://finmore.netlify.app/')"
    },
    en: {
      text: "Which Playwright command is used to navigate to a specified URL?",
      options: ["await page.goto('https://finmore.netlify.app/')", "await page.open('https://finmore.netlify.app/')", "await page.navigate('https://finmore.netlify.app/')", "await browser.goto('https://finmore.netlify.app/')"],
      correct: "await page.goto('https://finmore.netlify.app/')"
    },
    ru: {
      text: "Какая команда Playwright используется для перехода по указанному URL?",
      options: ["await page.goto('https://finmore.netlify.app/')", "await page.open('https://finmore.netlify.app/')", "await page.navigate('https://finmore.netlify.app/')", "await browser.goto('https://finmore.netlify.app/')"],
      correct: "await page.goto('https://finmore.netlify.app/')"
    }
  },
  {
    taskId: 1032,
    uk: {
      text: "Як правильно створити локатор для елемента за CSS-класом .login-form?",
      options: ["page.locator('.login-form')", "page.find('.login-form')", "page.getElement('.login-form')", "page.css('.login-form')"],
      correct: "page.locator('.login-form')"
    },
    en: {
      text: "How do you correctly create a locator for an element with CSS class .login-form?",
      options: ["page.locator('.login-form')", "page.find('.login-form')", "page.getElement('.login-form')", "page.css('.login-form')"],
      correct: "page.locator('.login-form')"
    },
    ru: {
      text: "Как правильно создать локатор для элемента по CSS-классу .login-form?",
      options: ["page.locator('.login-form')", "page.find('.login-form')", "page.getElement('.login-form')", "page.css('.login-form')"],
      correct: "page.locator('.login-form')"
    }
  },
  {
    taskId: 1033,
    uk: {
      text: "Який метод дозволяє запустити лише один конкретний тест під час налагодження?",
      options: ["test.only('my test', ...)", "test.focus('my test', ...)", "test.run('my test', ...)", "test.it('my test', ...)"],
      correct: "test.only('my test', ...)"
    },
    en: {
      text: "Which method allows you to run only one specific test during debugging?",
      options: ["test.only('my test', ...)", "test.focus('my test', ...)", "test.run('my test', ...)", "test.it('my test', ...)"],
      correct: "test.only('my test', ...)"
    },
    ru: {
      text: "Какой метод позволяет запустить только один конкретный тест во время отладки?",
      options: ["test.only('my test', ...)", "test.focus('my test', ...)", "test.run('my test', ...)", "test.it('my test', ...)"],
      correct: "test.only('my test', ...)"
    }
  },
  {
    taskId: 1034,
    uk: {
      text: "Як правильно перевірити заголовок сторінки (Title) в Playwright?",
      options: ["await expect(page).toHaveTitle('Finmore')", "await expect(page).toHaveUrl('Finmore')", "await page.title('Finmore')", "expect(title).toBe('Finmore')"],
      correct: "await expect(page).toHaveTitle('Finmore')"
    },
    en: {
      text: "How do you correctly assert the page title in Playwright?",
      options: ["await expect(page).toHaveTitle('Finmore')", "await expect(page).toHaveUrl('Finmore')", "await page.title('Finmore')", "expect(title).toBe('Finmore')"],
      correct: "await expect(page).toHaveTitle('Finmore')"
    },
    ru: {
      text: "Как правильно проверить заголовок страницы (Title) в Playwright?",
      options: ["await expect(page).toHaveTitle('Finmore')", "await expect(page).toHaveUrl('Finmore')", "await page.title('Finmore')", "expect(title).toBe('Finmore')"],
      correct: "await expect(page).toHaveTitle('Finmore')"
    }
  },
  {
    taskId: 1035,
    uk: {
      text: "Який локатор є найбільш пріоритетним та рекомендованим для пошуку кнопки 'Sign up'?",
      options: ["page.getByRole('button', { name: 'Sign up' })", "page.locator('.sign-up-btn')", "page.xpath('//button[text()=\"Sign up\"]')", "page.css('button.signup')"],
      correct: "page.getByRole('button', { name: 'Sign up' })"
    },
    en: {
      text: "Which locator has the highest priority and is recommended for finding the 'Sign up' button?",
      options: ["page.getByRole('button', { name: 'Sign up' })", "page.locator('.sign-up-btn')", "page.xpath('//button[text()=\"Sign up\"]')", "page.css('button.signup')"],
      correct: "page.getByRole('button', { name: 'Sign up' })"
    },
    ru: {
      text: "Какой локатор является наиболее приоритетным и рекомендуемым для поиска кнопки 'Sign up'?",
      options: ["page.getByRole('button', { name: 'Sign up' })", "page.locator('.sign-up-btn')", "page.xpath('//button[text()=\"Sign up\"]')", "page.css('button.signup')"],
      correct: "page.getByRole('button', { name: 'Sign up' })"
    }
  },
  {
    taskId: 1036,
    uk: {
      text: "Як знайти поле введення за його плейсхолдером 'Email'?",
      options: ["page.getByPlaceholder('Email')", "page.locator('.email-input')", "page.fill('Email', 'test@test.com')", "page.type('input[type=email]', 'test')"],
      correct: "page.getByPlaceholder('Email')"
    },
    en: {
      text: "How do you find an input field by its placeholder 'Email'?",
      options: ["page.getByPlaceholder('Email')", "page.locator('.email-input')", "page.fill('Email', 'test@test.com')", "page.type('input[type=email]', 'test')"],
      correct: "page.getByPlaceholder('Email')"
    },
    ru: {
      text: "Как найти поле ввода по его плейсхолдеру 'Email'?",
      options: ["page.getByPlaceholder('Email')", "page.locator('.email-input')", "page.fill('Email', 'test@test.com')", "page.type('input[type=email]', 'test')"],
      correct: "page.getByPlaceholder('Email')"
    }
  },
  {
    taskId: 1037,
    uk: {
      text: "Який метод Playwright знаходить поле форми за пов'язаним текстом лейбла 'Password'?",
      options: ["page.getByLabel('Password')", "page.locator('label[for=password]')", "page.xpath('//label[contains(text(), \"Password\")]')", "page.css('#password')"],
      correct: "page.getByLabel('Password')"
    },
    en: {
      text: "Which Playwright method finds a form field by its associated label text 'Password'?",
      options: ["page.getByLabel('Password')", "page.locator('label[for=password]')", "page.xpath('//label[contains(text(), \"Password\")]')", "page.css('#password')"],
      correct: "page.getByLabel('Password')"
    },
    ru: {
      text: "Какой метод Playwright находит поле формы по связанному тексту лейбла 'Password'?",
      options: ["page.getByLabel('Password')", "page.locator('label[for=password]')", "page.xpath('//label[contains(text(), \"Password\")]')", "page.css('#password')"],
      correct: "page.getByLabel('Password')"
    }
  },
  {
    taskId: 1038,
    uk: {
      text: "Як знайти елемент на сторінці за його видимим текстом 'Error'?",
      options: ["page.getByText('Error')", "page.locator('.error-message')", "page.find('Error')", "page.expect('Error')"],
      correct: "page.getByText('Error')"
    },
    en: {
      text: "How do you find an element on the page by its visible text 'Error'?",
      options: ["page.getByText('Error')", "page.locator('.error-message')", "page.find('Error')", "page.expect('Error')"],
      correct: "page.getByText('Error')"
    },
    ru: {
      text: "Как найти элемент на странице по его видимому тексту 'Error'?",
      options: ["page.getByText('Error')", "page.locator('.error-message')", "page.find('Error')", "page.expect('Error')"],
      correct: "page.getByText('Error')"
    }
  },
  {
    taskId: 1039,
    uk: {
      text: "Який метод найшвидше та найнадійніше заповнює поле введення значенням 'John'?",
      options: ["await page.fill('#name', 'John')", "await page.type('#name', 'John')", "await page.keyboard.type('John')", "await page.sendDate('#name', 'John')"],
      correct: "await page.fill('#name', 'John')"
    },
    en: {
      text: "Which method fastest and most reliably fills an input field with 'John'?",
      options: ["await page.fill('#name', 'John')", "await page.type('#name', 'John')", "await page.keyboard.type('John')", "await page.sendDate('#name', 'John')"],
      correct: "await page.fill('#name', 'John')"
    },
    ru: {
      text: "Какой метод быстрее и надежнее всего заполняет поле ввода значением 'John'?",
      options: ["await page.fill('#name', 'John')", "await page.type('#name', 'John')", "await page.keyboard.type('John')", "await page.sendDate('#name', 'John')"],
      correct: "await page.fill('#name', 'John')"
    }
  },
  {
    taskId: 1040,
    uk: {
      text: "Який рекомендований спосіб виконати клік по кнопці за допомогою семантичного локатора?",
      options: ["await page.click('button')", "await page.getByRole('button').click()", "await page.locator('button').tap()", "await page.mouse.click(10, 10)"],
      correct: "await page.getByRole('button').click()"
    },
    en: {
      text: "What is the recommended way to click a button using a semantic locator?",
      options: ["await page.click('button')", "await page.getByRole('button').click()", "await page.locator('button').tap()", "await page.mouse.click(10, 10)"],
      correct: "await page.getByRole('button').click()"
    },
    ru: {
      text: "Какой рекомендуемый способ выполнить клик по кнопке с помощью семантического локатора?",
      options: ["await page.click('button')", "await page.getByRole('button').click()", "await page.locator('button').tap()", "await page.mouse.click(10, 10)"],
      correct: "await page.getByRole('button').click()"
    }
  },
  {
    taskId: 1041,
    uk: {
      text: "Як правильно встановити прапорець (чекбокс) 'Remember me'?",
      options: ["await page.check('#remember')", "await page.click('#remember')", "await page.getByLabel('Remember me').check()", "await page.setChecked('#remember', true)"],
      correct: "await page.getByLabel('Remember me').check()"
    },
    en: {
      text: "How do you correctly check a checkbox labeled 'Remember me'?",
      options: ["await page.check('#remember')", "await page.click('#remember')", "await page.getByLabel('Remember me').check()", "await page.setChecked('#remember', true)"],
      correct: "await page.getByLabel('Remember me').check()"
    },
    ru: {
      text: "Как правильно установить флажок (чекбокс) 'Remember me'?",
      options: ["await page.check('#remember')", "await page.click('#remember')", "await page.getByLabel('Remember me').check()", "await page.setChecked('#remember', true)"],
      correct: "await page.getByLabel('Remember me').check()"
    }
  },
  {
    taskId: 1042,
    uk: {
      text: "Який метод локатора використовується для повного очищення поля введення?",
      options: ["await page.clear('#search')", "await page.fill('#search', '')", "await page.locator('#search').clear()", "await page.delete('#search')"],
      correct: "await page.locator('#search').clear()"
    },
    en: {
      text: "Which locator method is used to completely clear an input field?",
      options: ["await page.clear('#search')", "await page.fill('#search', '')", "await page.locator('#search').clear()", "await page.delete('#search')"],
      correct: "await page.locator('#search').clear()"
    },
    ru: {
      text: "Какой метод локатора используется для полной очистки поля ввода?",
      options: ["await page.clear('#search')", "await page.fill('#search', '')", "await page.locator('#search').clear()", "await page.delete('#search')"],
      correct: "await page.locator('#search').clear()"
    }
  },
  {
    taskId: 1043,
    uk: {
      text: "Як вибрати радіокнопку з лейблом 'Pro'?",
      options: ["await page.check('#plan')", "await page.getByLabel('Pro').check()", "await page.click('#plan')", "await page.select('#plan')"],
      correct: "await page.getByLabel('Pro').check()"
    },
    en: {
      text: "How do you select a radio button with the label 'Pro'?",
      options: ["await page.check('#plan')", "await page.getByLabel('Pro').check()", "await page.click('#plan')", "await page.select('#plan')"],
      correct: "await page.getByLabel('Pro').check()"
    },
    ru: {
      text: "Как выбрать радиокнопку с лейблом 'Pro'?",
      options: ["await page.check('#plan')", "await page.getByLabel('Pro').check()", "await page.click('#plan')", "await page.select('#plan')"],
      correct: "await page.getByLabel('Pro').check()"
    }
  },
  {
    taskId: 1044,
    uk: {
      text: "Як вибрати пункт 'Ukraine' у випадаючому списку (select)?",
      options: ["await page.selectOption('Ukraine')", "await page.fill('Ukraine')", "await page.click('Ukraine')", "await page.locator('select').selectOption('Ukraine')"],
      correct: "await page.locator('select').selectOption('Ukraine')"
    },
    en: {
      text: "How do you select the 'Ukraine' option in a select dropdown?",
      options: ["await page.selectOption('Ukraine')", "await page.fill('Ukraine')", "await page.click('Ukraine')", "await page.locator('select').selectOption('Ukraine')"],
      correct: "await page.locator('select').selectOption('Ukraine')"
    },
    ru: {
      text: "Как выбрать пункт 'Ukraine' в выпадающем списке (select)?",
      options: ["await page.selectOption('Ukraine')", "await page.fill('Ukraine')", "await page.click('Ukraine')", "await page.locator('select').selectOption('Ukraine')"],
      correct: "await page.locator('select').selectOption('Ukraine')"
    }
  },
  {
    taskId: 1046,
    uk: {
      text: "Яким типом даних є значення '12345' (у лапках)?",
      options: ["string", "number", "boolean", "object"],
      correct: "string"
    },
    en: {
      text: "What data type is the value '12345' (in quotes)?",
      options: ["string", "number", "boolean", "object"],
      correct: "string"
    },
    ru: {
      text: "Каким типом данных является значение '12345' (в кавычках)?",
      options: ["string", "number", "boolean", "object"],
      correct: "string"
    }
  },
  {
    taskId: 1047,
    uk: {
      text: "Виберіть значення, яке належить до логічного типу Boolean:",
      options: ["true", "\"true\"", "1", "null"],
      correct: "true"
    },
    en: {
      text: "Select the value that belongs to the Boolean type:",
      options: ["true", "\"true\"", "1", "null"],
      correct: "true"
    },
    ru: {
      text: "Выберите значение, которое относится к логическому типу Boolean:",
      options: ["true", "\"true\"", "1", "null"],
      correct: "true"
    }
  },
  {
    taskId: 1048,
    uk: {
      text: "Що трапиться, якщо забути написати await перед асинхронною дією у Playwright?",
      options: ["Тест піде далі, не дочекавшись завершення дії, що призведе до помилки", "Браузер автоматично зупиниться сам", "Код взагалі не запуститься", "Нічого, це просто необов'язкове слово"],
      correct: "Тест піде далі, не дочекавшись завершення дії, що призведе до помилки"
    },
    en: {
      text: "What happens if you forget to write await before an asynchronous action in Playwright?",
      options: ["The test will continue without waiting, leading to errors", "The browser will stop automatically", "The code won't run at all", "Nothing, it's just an optional keyword"],
      correct: "The test will continue without waiting, leading to errors"
    },
    ru: {
      text: "Что произойдет, если забыть написать await перед асинхронным действием в Playwright?",
      options: ["Тест пойдет дальше, не дождавшись завершения действия, что приведет к ошибке", "Браузер автоматически остановится сам", "Код вообще не запустится", "Ничего, это просто необязательное слово"],
      correct: "Тест пойдет дальше, не дождавшись завершения действия, что приведет к ошибке"
    }
  },
  {
    taskId: 1049,
    uk: {
      text: "Яке ключове слово необхідно вказати перед аргументами функції, щоб зробити її асинхронною?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    },
    en: {
      text: "Which keyword must be placed before function arguments to make it asynchronous?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    },
    ru: {
      text: "Какое ключевое слово необходимо указать перед аргументами функции, чтобы сделать ее асинхронной?",
      options: ["async", "await", "sync", "promise"],
      correct: "async"
    }
  },
  {
    taskId: 1050,
    uk: {
      text: "Як отримати доступ до властивості email об'єкта user?",
      options: ["user.email", "user['email']", "Обидва варіанти правильні", "user->email"],
      correct: "Обидва варіанти правильні"
    },
    en: {
      text: "How can you access the email property of the user object?",
      options: ["user.email", "user['email']", "Both options are correct", "user->email"],
      correct: "Both options are correct"
    },
    ru: {
      text: "Как получить доступ к свойству email объекта user?",
      options: ["user.email", "user['email']", "Оба варианта верны", "user->email"],
      correct: "Оба варианта верны"
    }
  },
  {
    taskId: 1051,
    uk: {
      text: "Яка конструкція витягне властивість page з об'єкта options за допомогою деструктуризації?",
      options: ["const { page } = options;", "const [ page ] = options;", "const page = options{page};", "extract page from options;"],
      correct: "const { page } = options;"
    },
    en: {
      text: "Which syntax extracts the page property from options using destructuring?",
      options: ["const { page } = options;", "const [ page ] = options;", "const page = options{page};", "extract page from options;"],
      correct: "const { page } = options;"
    },
    ru: {
      text: "Какая конструкция извлечет свойство page из объекта options с помощью деструктуризации?",
      options: ["const { page } = options;", "const [ page ] = options;", "const page = options{page};", "extract page from options;"],
      correct: "const { page } = options;"
    }
  },
  {
    taskId: 1052,
    uk: {
      text: "Який індекс має перший елемент у будь-якому масиві?",
      options: ["0", "1", "-1", "A"],
      correct: "0"
    },
    en: {
      text: "What index does the first element have in any array?",
      options: ["0", "1", "-1", "A"],
      correct: "0"
    },
    ru: {
      text: "Какой индекс имеет первый элемент в любом массиве?",
      options: ["0", "1", "-1", "A"],
      correct: "0"
    }
  },
  {
    taskId: 1053,
    uk: {
      text: "Який символ використовується для створення шаблонних рядків (Template Literals) для інтерполяції ${...}?",
      options: ["Зворотна лапка `", "Звичайна лапка '", "Подвійна лапка \"", "Дужки ( )"],
      correct: "Зворотна лапка `"
    },
    en: {
      text: "Which symbol is used to create template literals for ${...} string interpolation?",
      options: ["Backtick `", "Single quote '", "Double quote \"", "Parentheses ( )"],
      correct: "Backtick `"
    },
    ru: {
      text: "Какой символ используется для создания шаблонных строк (Template Literals) для интерполяции ${...}?",
      options: ["Обратная кавычка `", "Обычная кавычка '", "Двойная кавычка \"", "Скобки ( )"],
      correct: "Обратная кавычка `"
    }
  },
  {
    taskId: 1054,
    uk: {
      text: "Який оператор використовується для суворого порівняння на нерівність (з урахуванням типу даних)?",
      options: ["!==", "!=", "=", "=="],
      correct: "!=="
    },
    en: {
      text: "Which operator is used for strict inequality comparison (checking both value and type)?",
      options: ["!==", "!=", "=", "=="],
      correct: "!=="
    },
    ru: {
      text: "Какой оператор используется для строгого сравнения на неравенство (с учетом типа данных)?",
      options: ["!==", "!=", "=", "=="],
      correct: "!=="
    }
  },
  {
    taskId: 1055,
    uk: {
      text: "Який блок виконається в конструкції if (false) { ... } else { ... }?",
      options: ["Блок else", "Блок if", "Весь код зупиниться з помилкою", "Обидва блоки одночасно"],
      correct: "Блок else"
    },
    en: {
      text: "Which block will execute in if (false) { ... } else { ... }?",
      options: ["The else block", "The if block", "The code will stop with an error", "Both blocks simultaneously"],
      correct: "The else block"
    },
    ru: {
      text: "Какой блок выполнится в конструкции if (false) { ... } else { ... }?",
      options: ["Блок else", "Блок if", "Весь код остановится с ошибкой", "Оба блока одновременно"],
      correct: "Блок else"
    }
  },
  {
    taskId: 1056,
    uk: {
      text: "Який правильний синтаксис стрілочної функції (Arrow Function)?",
      options: ["(arg) => { }", "function => { }", "arg -> { }", "=> (arg) { }"],
      correct: "(arg) => { }"
    },
    en: {
      text: "What is the correct syntax for an arrow function?",
      options: ["(arg) => { }", "function => { }", "arg -> { }", "=> (arg) { }"],
      correct: "(arg) => { }"
    },
    ru: {
      text: "Каков правильный синтаксис стрелочной функции (Arrow Function)?",
      options: ["(arg) => { }", "function => { }", "arg -> { }", "=> (arg) { }"],
      correct: "(arg) => { }"
    }
  },
  {
    taskId: 1057,
    uk: {
      text: "Як безпечно звернутися до поля title, якщо об'єкт post може бути null або undefined?",
      options: ["post?.title", "post.title", "post!!!title", "post?title"],
      correct: "post?.title"
    },
    en: {
      text: "How do you safely access title if post might be null or undefined?",
      options: ["post?.title", "post.title", "post!!!title", "post?title"],
      correct: "post?.title"
    },
    ru: {
      text: "Как безопасно обратиться к полю title, если объект post может быть null или undefined?",
      options: ["post?.title", "post.title", "post!!!title", "post?title"],
      correct: "post?.title"
    }
  },
  {
    taskId: 1058,
    uk: {
      text: "В якому блоці конструкції try...catch обробляється виникла помилка?",
      options: ["catch", "try", "finally", "error"],
      correct: "catch"
    },
    en: {
      text: "In which block of try...catch is an error caught and handled?",
      options: ["catch", "try", "finally", "error"],
      correct: "catch"
    },
    ru: {
      text: "В каком блоке конструкции try...catch обрабатывается возникшая ошибка?",
      options: ["catch", "try", "finally", "error"],
      correct: "catch"
    }
  },
  {
    taskId: 1059,
    uk: {
      text: "Де зазвичай розміщують інструкції import у файлі тестів?",
      options: ["На самому початку файлу", "В кінці тесту", "Всередині блоку async", "Після кожного кліку"],
      correct: "На самому початку файлу"
    },
    en: {
      text: "Where are import statements typically placed in a test file?",
      options: ["At the very beginning of the file", "At the end of the test", "Inside the async block", "After each click"],
      correct: "At the very beginning of the file"
    },
    ru: {
      text: "Где обычно размещают инструкции import в файле тестов?",
      options: ["В самом начале файла", "В конце теста", "Внутри блока async", "После каждого клика"],
      correct: "В самом начале файла"
    }
  }
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log(`Inserting/updating ${questionsData.length} questions into task_questions...`);

  for (const q of questionsData) {
    // Check if question already exists for this task
    const [existing] = await conn.execute("SELECT id FROM task_questions WHERE task_id = ?", [q.taskId]);
    if (existing.length > 0) {
      // Update existing
      await conn.execute(
        `UPDATE task_questions 
         SET text = ?, text_en = ?, text_ru = ?, 
             options = ?, options_en = ?, options_ru = ?,
             correct_answer = ?, correct_answer_en = ?, correct_answer_ru = ?
         WHERE task_id = ?`,
        [
          q.uk.text, q.en.text, q.ru.text,
          JSON.stringify(q.uk.options), JSON.stringify(q.en.options), JSON.stringify(q.ru.options),
          q.uk.correct, q.en.correct, q.ru.correct,
          q.taskId
        ]
      );
      console.log(`Updated task ${q.taskId}`);
    } else {
      // Insert new
      await conn.execute(
        `INSERT INTO task_questions 
         (task_id, text, text_en, text_ru, options, options_en, options_ru, correct_answer, correct_answer_en, correct_answer_ru, \`order\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          q.taskId,
          q.uk.text, q.en.text, q.ru.text,
          JSON.stringify(q.uk.options), JSON.stringify(q.en.options), JSON.stringify(q.ru.options),
          q.uk.correct, q.en.correct, q.ru.correct
        ]
      );
      console.log(`Inserted question for task ${q.taskId}`);
    }
  }

  console.log("All questions successfully inserted/updated!");
  await conn.end();
}

main().catch(err => {
  console.error("Error seeding questions:", err);
  process.exit(1);
});
