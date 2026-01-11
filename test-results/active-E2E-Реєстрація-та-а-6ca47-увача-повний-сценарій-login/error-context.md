# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "Вхід до системи" [level=1] [ref=e10]
    - paragraph [ref=e11]: Увійдіть до свого облікового запису
  - paragraph [ref=e13]: Невірний email або пароль
  - generic [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]: Email адреса
      - generic [ref=e17]:
        - img [ref=e18]
        - textbox "your@email.com" [ref=e21]: ivan.petrenko@test.com
    - generic [ref=e22]:
      - generic [ref=e23]: Пароль
      - generic [ref=e24]:
        - img [ref=e25]
        - textbox "Введіть пароль" [active] [ref=e28]: Test1234
        - button "Show password" [ref=e29] [cursor=pointer]:
          - img [ref=e30]
    - button "Увійти" [ref=e33] [cursor=pointer]
  - paragraph [ref=e35]:
    - text: Немає облікового запису?
    - button "Зареєструватися" [ref=e36] [cursor=pointer]
  - generic [ref=e38]:
    - paragraph [ref=e39]: "Демо облікові записи:"
    - generic [ref=e40]:
      - paragraph [ref=e41]: admin@demo.com / admin123
      - paragraph [ref=e42]: user@demo.com / user123
```