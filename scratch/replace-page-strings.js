const fs = require('fs')
const path = require('path')

const pagePath = path.join(__dirname, '../src/app/[locale]/setup/page.tsx')
let content = fs.readFileSync(pagePath, 'utf8')

// Python step
content = content.replace(/"Потужна та проста мова програмування."/g, "t('pyDesc')")
content = content.replace(/Завантажте та встановіть Python. Переконайтеся, що під час встановлення ви відмітили галочку <strong>"Add Python to PATH"<\/strong>./g, "{t.rich('pyContent', { strong: (chunks) => <strong>{chunks}</strong> })}")
content = content.replace(/Завантажити Python/g, "{t('pyBtn')}")

// C# step
content = content.replace(/"Платформа від Microsoft для розробки мовою C#."/g, "t('csDesc')")
content = content.replace(/Завантажте та встановіть \.NET SDK для вашої операційної системи./g, "{t('csContent')}")
content = content.replace(/Завантажити \.NET SDK/g, "{t('csBtn')}")

// PW Python
content = content.replace(/Відкрийте термінал та встановіть Playwright за допомогою pip:/g, "{t('pwPyDesc')}")

// PW C#
content = content.replace(/Створіть новий NUnit проект та встановіть Playwright:/g, "{t('pwCsDesc')}")

// PW Options
content = content.replace(/<li>Do you want to use TypeScript or JavaScript\? <strong>TypeScript<\/strong><\/li>/g, "<li>{t.rich('pwOption1', { strong: (chunks) => <strong>{chunks}</strong> })}</li>")
content = content.replace(/<li>Where to put your end-to-end tests\? <strong>tests<\/strong><\/li>/g, "<li>{t.rich('pwOption2', { strong: (chunks) => <strong>{chunks}</strong> })}</li>")
content = content.replace(/<li>Add a GitHub Actions workflow\? <strong>Yes \(або No\)<\/strong><\/li>/g, "<li>{t.rich('pwOption3', { strong: (chunks) => <strong>{chunks}</strong> })}</li>")
content = content.replace(/<li>Install Playwright browsers\? <strong>Yes<\/strong><\/li>/g, "<li>{t.rich('pwOption4', { strong: (chunks) => <strong>{chunks}</strong> })}</li>")

// Ext Python
content = content.replace(/Офіційне розширення для підтримки мови Python./g, "{t('extPy')}")

// Ext C#
content = content.replace(/Офіційне розширення для C#./g, "{t('extCs')}")

fs.writeFileSync(pagePath, content)
console.log('done replacing')
