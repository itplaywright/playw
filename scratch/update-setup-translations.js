const fs = require('fs')
const path = require('path')

const ukPath = path.join(__dirname, '../messages/uk.json')
const enPath = path.join(__dirname, '../messages/en.json')
const ruPath = path.join(__dirname, '../messages/ru.json')

const uk = {
  "Onboarding": {
    "backToDashboard": "Назад до дашборду",
    "badge": "Інструкція",
    "title1": "Налаштування",
    "title2": "середовища",
    "subtitle": "Кілька кроків для підготовки комп'ютера до автоматизації. Зробіть це один раз, і ви готові писати тести.",
    "langTitle": "Мова програмування",
    "langDesc": "Оберіть мову програмування, яку ви хочете вивчати.",
    "langContent": "Цей вибір буде закріплено за вашим профілем. Ви будете отримувати завдання та матеріали саме для цієї мови.",
    "nodeDesc": "Рушій, який дозволяє запускати JavaScript поза браузером.",
    "nodeContent1": "Завантажте та встановіть Node.js. Рекомендується вибрати версію <strong>LTS (Long Term Support)</strong>.",
    "nodeBtn": "Завантажити Node.js",
    "nodeCheck": "Перевірка встановлення",
    "nodeCheckDesc": "Має вивести версію, наприклад v20.x.x",
    "vsDesc": "Редактор коду від Microsoft. Швидкий, зі зручними плагінами.",
    "vsContent1": "Visual Studio Code — це потужний редактор для роботи з тестами.",
    "vsBtn": "Завантажити VS Code",
    "vsExt": "Корисні розширення:",
    "vsExt1": "Офіційне розширення для запуску та дебагу тестів прямо з редактора.",
    "vsExt2": "Для автоматичного форматування коду.",
    "gitDesc": "Система контролю версій. Зберігає історію ваших змін.",
    "gitContent1": "Git потрібен для завантаження репозиторіїв та збереження вашого коду у хмару (GitHub).",
    "gitBtn": "Завантажити Git",
    "pwDesc": "Останній крок — створення вашого першого проекту автотестів.",
    "pwContent1": "Створіть нову папку на комп'ютері, відкрийте її у VS Code, потім відкрийте термінал у VS Code (Terminal > New Terminal) і виконайте:",
    "pwSettings": "Під час встановлення оберіть наступні налаштування:",
    "finishTitle": "Завершення",
    "finishDesc": "Коли все буде готово, натисніть кнопку нижче, щоб перейти до навчання.",
    "finishBtn": "Налаштовано",
    "finishLoading": "Завантаження...",
    "success": "Ви готові до випробувань!",
    "error": "Щось пішло не так"
  }
}

const en = {
  "Onboarding": {
    "backToDashboard": "Back to dashboard",
    "badge": "Instruction",
    "title1": "Environment",
    "title2": "setup",
    "subtitle": "A few steps to prepare your computer for automation. Do this once, and you are ready to write tests.",
    "langTitle": "Programming language",
    "langDesc": "Choose the programming language you want to learn.",
    "langContent": "This choice will be attached to your profile. You will receive tasks and materials specifically for this language.",
    "nodeDesc": "The engine that allows running JavaScript outside the browser.",
    "nodeContent1": "Download and install Node.js. It is recommended to choose the <strong>LTS (Long Term Support)</strong> version.",
    "nodeBtn": "Download Node.js",
    "nodeCheck": "Installation check",
    "nodeCheckDesc": "Should output the version, for example v20.x.x",
    "vsDesc": "Code editor from Microsoft. Fast, with convenient plugins.",
    "vsContent1": "Visual Studio Code is a powerful editor for working with tests.",
    "vsBtn": "Download VS Code",
    "vsExt": "Useful extensions:",
    "vsExt1": "Official extension for running and debugging tests directly from the editor.",
    "vsExt2": "For automatic code formatting.",
    "gitDesc": "Version control system. Saves the history of your changes.",
    "gitContent1": "Git is needed to download repositories and save your code to the cloud (GitHub).",
    "gitBtn": "Download Git",
    "pwDesc": "The final step — creating your first autotest project.",
    "pwContent1": "Create a new folder on your computer, open it in VS Code, then open the terminal in VS Code (Terminal > New Terminal) and run:",
    "pwSettings": "During installation, select the following settings:",
    "finishTitle": "Completion",
    "finishDesc": "When everything is ready, click the button below to proceed to learning.",
    "finishBtn": "Configured",
    "finishLoading": "Loading...",
    "success": "You are ready for the challenges!",
    "error": "Something went wrong"
  }
}

const ru = {
  "Onboarding": {
    "backToDashboard": "Назад к дашборду",
    "badge": "Инструкция",
    "title1": "Настройка",
    "title2": "среды",
    "subtitle": "Несколько шагов для подготовки компьютера к автоматизации. Сделайте это один раз, и вы готовы писать тесты.",
    "langTitle": "Язык программирования",
    "langDesc": "Выберите язык программирования, который хотите изучать.",
    "langContent": "Этот выбор будет закреплен за вашим профилем. Вы будете получать задания и материалы именно для этого языка.",
    "nodeDesc": "Движок, который позволяет запускать JavaScript вне браузера.",
    "nodeContent1": "Скачайте и установите Node.js. Рекомендуется выбрать версию <strong>LTS (Long Term Support)</strong>.",
    "nodeBtn": "Скачать Node.js",
    "nodeCheck": "Проверка установки",
    "nodeCheckDesc": "Должно вывести версию, например v20.x.x",
    "vsDesc": "Редактор кода от Microsoft. Быстрый, с удобными плагинами.",
    "vsContent1": "Visual Studio Code — это мощный редактор для работы с тестами.",
    "vsBtn": "Скачать VS Code",
    "vsExt": "Полезные расширения:",
    "vsExt1": "Официальное расширение для запуска и дебага тестов прямо из редактора.",
    "vsExt2": "Для автоматического форматирования кода.",
    "gitDesc": "Система контроля версий. Сохраняет историю ваших изменений.",
    "gitContent1": "Git нужен для скачивания репозиториев и сохранения вашего кода в облако (GitHub).",
    "gitBtn": "Скачать Git",
    "pwDesc": "Последний шаг — создание вашего первого проекта автотестов.",
    "pwContent1": "Создайте новую папку на компьютере, откройте ее в VS Code, затем откройте терминал в VS Code (Terminal > New Terminal) и выполните:",
    "pwSettings": "Во время установки выберите следующие настройки:",
    "finishTitle": "Завершение",
    "finishDesc": "Когда все будет готово, нажмите кнопку ниже, чтобы перейти к обучению.",
    "finishBtn": "Настроено",
    "finishLoading": "Загрузка...",
    "success": "Вы готовы к испытаниям!",
    "error": "Что-то пошло не так"
  }
}

function updateJson(filePath, newKeys) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const merged = { ...content, ...newKeys }
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2))
}

updateJson(ukPath, uk)
updateJson(enPath, en)
updateJson(ruPath, ru)
console.log("JSON files updated")
