const fs = require('fs')
const path = require('path')

const ukPath = path.join(__dirname, '../messages/uk.json')
const enPath = path.join(__dirname, '../messages/en.json')
const ruPath = path.join(__dirname, '../messages/ru.json')

const authUk = {
  "Auth": {
    "loginTitle": "Вхід на платформу",
    "loginSubtitle": "Продовжуйте свою практику автоматизації",
    "email": "Email",
    "password": "Пароль",
    "loginButton": "Увійти",
    "noAccount": "Немає акаунту?",
    "createNow": "Створити зараз",
    "backToHome": "← На головну",
    "registerTitle": "Реєстрація",
    "registerSubtitle": "Почніть свій шлях в автоматизації прямо зараз",
    "firstName": "Ім'я",
    "registerButton": "Зареєструватися",
    "hasAccount": "Вже маєте акаунт?",
    "loginNow": "Увійти",
    "invalidLogin": "Невірний email або пароль",
    "errorOccurred": "Щось пішло не так. Спробуйте пізніше."
  }
}

const authEn = {
  "Auth": {
    "loginTitle": "Log in to the Platform",
    "loginSubtitle": "Continue your automation practice",
    "email": "Email",
    "password": "Password",
    "loginButton": "Log in",
    "noAccount": "Don't have an account?",
    "createNow": "Create now",
    "backToHome": "← Back to Home",
    "registerTitle": "Registration",
    "registerSubtitle": "Start your journey in automation right now",
    "firstName": "First Name",
    "registerButton": "Sign up",
    "hasAccount": "Already have an account?",
    "loginNow": "Log in",
    "invalidLogin": "Invalid email or password",
    "errorOccurred": "Something went wrong. Try again later."
  }
}

const authRu = {
  "Auth": {
    "loginTitle": "Вход на платформу",
    "loginSubtitle": "Продолжайте свою практику автоматизации",
    "email": "Email",
    "password": "Пароль",
    "loginButton": "Войти",
    "noAccount": "Нет аккаунта?",
    "createNow": "Создать сейчас",
    "backToHome": "← На главную",
    "registerTitle": "Регистрация",
    "registerSubtitle": "Начните свой путь в автоматизации прямо сейчас",
    "firstName": "Имя",
    "registerButton": "Зарегистрироваться",
    "hasAccount": "Уже есть аккаунт?",
    "loginNow": "Войти",
    "invalidLogin": "Неверный email или пароль",
    "errorOccurred": "Что-то пошло не так. Попробуйте позже."
  }
}

function updateJson(filePath, newKeys) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const merged = { ...content, ...newKeys }
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2))
}

updateJson(ukPath, authUk)
updateJson(enPath, authEn)
updateJson(ruPath, authRu)
console.log("JSON files updated")
