const fs = require('fs')
const path = require('path')

const files = [
    {
        p: path.join(__dirname, '../messages/uk.json'),
        keys: {
            "dashboard": "Дашборд",
            "theory": "Теорія",
            "tasks": "Завдання",
            "projects": "Проєкти",
            "pricing": "Тарифи",
            "adminPanel": "Адмін"
        }
    },
    {
        p: path.join(__dirname, '../messages/en.json'),
        keys: {
            "dashboard": "Dashboard",
            "theory": "Theory",
            "tasks": "Tasks",
            "projects": "Projects",
            "pricing": "Pricing",
            "adminPanel": "Admin"
        }
    },
    {
        p: path.join(__dirname, '../messages/ru.json'),
        keys: {
            "dashboard": "Дашборд",
            "theory": "Теория",
            "tasks": "Задания",
            "projects": "Проекты",
            "pricing": "Тарифы",
            "adminPanel": "Админ"
        }
    }
]

for (const f of files) {
    const content = JSON.parse(fs.readFileSync(f.p, 'utf8'))
    content.Header = { ...content.Header, ...f.keys }
    fs.writeFileSync(f.p, JSON.stringify(content, null, 2))
}
console.log('Header translations updated')
