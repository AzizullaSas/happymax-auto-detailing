# HappyMax Auto Detailing

Лендинг мобильного детейлинга (Оаху, Гавайи). Статика: HTML + CSS + vanilla JS, без сборки.
Деплой: push в `main` → GitHub Pages.

- `index.html` — вся страница
- `assets/css/style.css` — стили (цвета и шрифты в `:root`)
- `assets/js/main.js` — цены (`PRICES`, `ADDONS`), калькулятор, слайдер до/после, форма

Телефон `(808) 452-0002` и email `happymaxautodetailing@gmail.com` — настоящие.
⚠️ Остальное пока моковое: отзывы, рейтинг, статистика,
фото с Unsplash. Форма записи ничего никуда не отправляет — только показывает подтверждение.

## Telegram-бот

Бот для заявок: **@happymaxdeatailing_bot** (id 9239364514).
Токен хранится в Supabase-проекте `fujjzktpumaxnyofsszy` (общий с хендименом),
таблица `app_config`, ключ `detailing_telegram_bot_token` (RLS, доступ только у service role).
Ключ `telegram_bot_token` в той же таблице — это бот хендимена, его не трогать.
Форма сайта к боту пока не подключена.
