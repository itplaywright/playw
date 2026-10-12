const fs = require('fs')
const path = require('path')

const files = [
    {
        p: '../messages/uk.json',
        keys: {
            "pyDesc": "Потужна та проста мова програмування.",
            "pyContent": "Завантажте та встановіть Python. Переконайтеся, що під час встановлення ви відмітили галочку <strong>\"Add Python to PATH\"</strong>.",
            "pyBtn": "Завантажити Python",
            "csDesc": "Платформа від Microsoft для розробки мовою C#.",
            "csContent": "Завантажте та встановіть .NET SDK для вашої операційної системи.",
            "csBtn": "Завантажити .NET SDK",
            "pwPyDesc": "Відкрийте термінал та встановіть Playwright за допомогою pip:",
            "pwCsDesc": "Створіть новий NUnit проект та встановіть Playwright:",
            "pwOption1": "Do you want to use TypeScript or JavaScript? <strong>TypeScript</strong>",
            "pwOption2": "Where to put your end-to-end tests? <strong>tests</strong>",
            "pwOption3": "Add a GitHub Actions workflow? <strong>Yes (або No)</strong>",
            "pwOption4": "Install Playwright browsers? <strong>Yes</strong>",
            "extPy": "Офіційне розширення для підтримки мови Python.",
            "extCs": "Офіційне розширення для C#."
        }
    },
    {
        p: '../messages/en.json',
        keys: {
            "pyDesc": "A powerful and easy-to-use programming language.",
            "pyContent": "Download and install Python. Make sure you check the box <strong>\"Add Python to PATH\"</strong> during installation.",
            "pyBtn": "Download Python",
            "csDesc": "Microsoft's platform for C# development.",
            "csContent": "Download and install the .NET SDK for your operating system.",
            "csBtn": "Download .NET SDK",
            "pwPyDesc": "Open a terminal and install Playwright using pip:",
            "pwCsDesc": "Create a new NUnit project and install Playwright:",
            "pwOption1": "Do you want to use TypeScript or JavaScript? <strong>TypeScript</strong>",
            "pwOption2": "Where to put your end-to-end tests? <strong>tests</strong>",
            "pwOption3": "Add a GitHub Actions workflow? <strong>Yes (or No)</strong>",
            "pwOption4": "Install Playwright browsers? <strong>Yes</strong>",
            "extPy": "Official extension for Python language support.",
            "extCs": "Official extension for C#."
        }
    },
    {
        p: '../messages/ru.json',
        keys: {
            "pyDesc": "Мощный и простой язык программирования.",
            "pyContent": "Скачайте и установите Python. Убедитесь, что во время установки вы отметили галочку <strong>\"Add Python to PATH\"</strong>.",
            "pyBtn": "Скачать Python",
            "csDesc": "Платформа от Microsoft для разработки на языке C#.",
            "csContent": "Скачайте и установите .NET SDK для вашей операционной системы.",
            "csBtn": "Скачать .NET SDK",
            "pwPyDesc": "Откройте терминал и установите Playwright с помощью pip:",
            "pwCsDesc": "Создайте новый проект NUnit и установите Playwright:",
            "pwOption1": "Do you want to use TypeScript or JavaScript? <strong>TypeScript</strong>",
            "pwOption2": "Where to put your end-to-end tests? <strong>tests</strong>",
            "pwOption3": "Add a GitHub Actions workflow? <strong>Yes (или No)</strong>",
            "pwOption4": "Install Playwright browsers? <strong>Yes</strong>",
            "extPy": "Официальное расширение для поддержки языка Python.",
            "extCs": "Официальное расширение для C#."
        }
    }
]

for (const f of files) {
    const full = path.join(__dirname, f.p)
    const content = JSON.parse(fs.readFileSync(full, 'utf8'))
    content.Onboarding = { ...content.Onboarding, ...f.keys }
    fs.writeFileSync(full, JSON.stringify(content, null, 2))
}
console.log('updated remaining translations')
