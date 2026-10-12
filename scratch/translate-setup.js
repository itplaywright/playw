const fs = require('fs')
const path = require('path')

const pagePath = path.join(__dirname, '../src/app/[locale]/setup/page.tsx')
let content = fs.readFileSync(pagePath, 'utf8')

// Step 2
content = content.replace(/"Редактор коду від Microsoft. Швидкий, зі зручними плагінами."/g, "t('vsDesc')")
content = content.replace(/Visual Studio Code — це потужний редактор для роботи з тестами./g, "{t('vsContent1')}")
content = content.replace(/Завантажити VS Code/g, "{t('vsBtn')}")
content = content.replace(/Корисні розширення:/g, "{t('vsExt')}")
content = content.replace(/Офіційне розширення для запуску та дебагу тестів прямо з редактора./g, "{t('vsExt1')}")
content = content.replace(/Для автоматичного форматування коду./g, "{t('vsExt2')}")

// Step 3
content = content.replace(/"Система контролю версій. Зберігає історію ваших змін."/g, "t('gitDesc')")
content = content.replace(/Git потрібен для завантаження репозиторіїв та збереження вашого коду у хмару \(GitHub\)./g, "{t('gitContent1')}")
content = content.replace(/Завантажити Git/g, "{t('gitBtn')}")
content = content.replace(/Перевірка встановлення/g, "{t('nodeCheck')}") // reusing nodeCheck for gitCheck because I only added nodeCheck

// Step 4
content = content.replace(/"Останній крок — створення вашого першого проекту автотестів."/g, "t('pwDesc')")
content = content.replace(/Створіть нову папку на комп'ютері, відкрийте її у VS Code, потім відкрийте термінал у VS Code \(Terminal {'>'} New Terminal\) і виконайте:/g, "{t('pwContent1')}")
content = content.replace(/Під час встановлення оберіть наступні налаштування:/g, "{t('pwSettings')}")

// Headers
content = content.replace(/Назад до дашборду/g, "{t('backToDashboard')}")
content = content.replace(/Інструкція/g, "{t('badge')}")
content = content.replace(/Налаштування <br className="hidden sm:block" \/>\s*<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">\s*середовища\s*<\/span>/, "{t('title1')} <br className=\"hidden sm:block\" />\n                        <span className=\"text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500\">\n                            {t('title2')}\n                        </span>")
content = content.replace(/Кілька кроків для підготовки комп'ютера до автоматизації. Зробіть це один раз, і ви готові писати тести./g, "{t('subtitle')}")

// Finish section
content = content.replace(/Завершення/g, "{t('finishTitle')}")
content = content.replace(/Коли все буде готово, натисніть кнопку нижче, щоб перейти до навчання./g, "{t('finishDesc')}")

// Finish button
content = content.replace(/toast\.success\("Ви готові до випробувань!"\)/g, "toast.success(t('success'))")
content = content.replace(/toast\.error\("Щось пішло не так"\)/g, "toast.error(t('error'))")
content = content.replace(/Налаштовано/g, "{t('finishBtn')}")
content = content.replace(/function FinishButton\(\{ programmingLanguage \}: \{ programmingLanguage: string \}\) \{/, "function FinishButton({ programmingLanguage, t }: { programmingLanguage: string, t: any }) {")
content = content.replace(/<FinishButton programmingLanguage=\{programmingLanguage\} \/>/g, "<FinishButton programmingLanguage={programmingLanguage} t={t} />")

fs.writeFileSync(pagePath, content)
console.log("Setup page translated")
