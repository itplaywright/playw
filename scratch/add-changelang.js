const fs = require('fs')
const path = require('path')

const files = [
    { p: '../messages/uk.json', str: "Змінити обрану мову програмування" },
    { p: '../messages/en.json', str: "Change selected programming language" },
    { p: '../messages/ru.json', str: "Изменить выбранный язык программирования" }
]

for (const f of files) {
    const full = path.join(__dirname, f.p)
    const content = JSON.parse(fs.readFileSync(full, 'utf8'))
    content.Onboarding.changeLanguage = f.str
    fs.writeFileSync(full, JSON.stringify(content, null, 2))
}
console.log('updated changeLanguage')
