# 🛍 Telegram Shop Bot

Telegram-бот магазина одежды с веб-приложением (Web App) и Google Таблицей в качестве базы данных.

![Telegram](https://img.shields.io/badge/Telegram-Bot-blue?logo=telegram)
![Google Apps Script](https://img.shields.io/badge/Google-Apps%20Script-green?logo=google)

## Возможности

- 📱 Веб-приложение (Telegram Web App) с каталогом товаров
- 🔍 Поиск по названию и описанию
- 🏷 Фильтрация по типу товара
- 💰 Сортировка по цене
- 💬 Кнопка связи с продавцом
- 📊 Google Таблица как база данных — без сервера
- 🎨 Тёмная тема, анимации, адаптация под тему Telegram

## Архитектура

```
Google Таблица (база данных)
       ↕
Google Apps Script (бэкенд + API)
       ↕
Telegram Bot ←→ Web App (HTML)
```

## Установка

1. Создай бота через [@BotFather](https://t.me/BotFather)
2. Создай Google Таблицу с листом **«Товары»** (столбцы: ID, Название, Фото, Тип, Описание, Цена)
3. В таблице: **Расширения → Apps Script** — вставь `Code.gs` и `shop.html`
4. Заполни переменные в `Code.gs` (токен, chat id, юзернейм, url деплоя)
5. Задеплой как веб-приложение, запусти `setWebhook`

## Технологии

- **Backend:** Google Apps Script
- **Frontend:** HTML/CSS/JS (Telegram Web App)
- **Database:** Google Sheets
- **Bot API:** Telegram Bot API + Webhooks
