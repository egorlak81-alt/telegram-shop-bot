// ============================================================
//  Google Apps Script — Telegram Shop Bot Backend
//  GitHub: https://github.com/YOUR_USERNAME/telegram-shop-bot
// ============================================================

// ═══════════════ НАСТРОЙКИ (ЗАПОЛНИ СВОИ ДАННЫЕ) ═══════════════
const BOT_TOKEN     = 'ВСТАВЬ_ТОКЕН_БОТА';          // Получи у @BotFather
const SHEET_NAME    = 'Товары';                       // Название листа в таблице
const OWNER_CHAT_ID = 'ВСТАВЬ_СВОЙ_CHAT_ID';         // Узнай через @userinfobot
const OWNER_USERNAME = 'ВСТАВЬ_ЮЗЕРНЕЙМ';            // Без @, например: my_shop
const DEPLOYED_URL  = 'ВСТАВЬ_URL_ДЕПЛОЯ';            // URL после публикации Apps Script

// ═══════════════ TELEGRAM API ═══════════════

function tgApi(method, payload) {
  try {
    return UrlFetchApp.fetch(
      'https://api.telegram.org/bot' + BOT_TOKEN + '/' + method,
      { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true }
    );
  } catch(e) { return null; }
}

function sendMsg(chatId, text, extra) {
  tgApi('sendMessage', Object.assign({ chat_id: chatId, text: text, parse_mode: 'HTML' }, extra || {}));
}

// ═══════════════ ВЕБХУК ═══════════════

function setWebhook() {
  UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true', {muteHttpExceptions: true});
  Utilities.sleep(1000);
  var r = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + BOT_TOKEN + '/setWebhook?url=' + encodeURIComponent(DEPLOYED_URL) + '&drop_pending_updates=true&max_connections=1',
    {muteHttpExceptions: true}
  );
  Logger.log(r.getContentText());
}

function deleteWebhook() {
  var r = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true',
    {muteHttpExceptions: true}
  );
  Logger.log(r.getContentText());
}

// ═══════════════ ОБРАБОТКА СООБЩЕНИЙ ═══════════════

function doPost(e) {
  var ok = ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);

  try {
    var body = JSON.parse(e.postData.contents);
    if (!body.message || !body.message.text) return ok;

    if (body.message.text === '/start') {
      sendMsg(body.message.chat.id,
        '👋 Добро пожаловать!\n\nНажмите кнопку ниже, чтобы открыть каталог:',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🛍 Открыть магазин', web_app: { url: DEPLOYED_URL + '?mode=shop' } }
            ]]
          }
        }
      );
    }
  } catch (err) {
    Logger.log('doPost: ' + err);
  }

  return ok;
}

// ═══════════════ GET ЗАПРОСЫ ═══════════════

function doGet(e) {
  var p = e.parameter || {};

  if (p.action === 'getProducts') {
    return jsonOut({ success: true, products: getProducts(), ts: Date.now() });
  }

  if (p.action === 'getConfig') {
    return jsonOut({ success: true, ownerUsername: OWNER_USERNAME });
  }

  if (p.mode === 'shop') {
    return HtmlService.createHtmlOutputFromFile('shop')
      .setTitle('Магазин')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return ContentService.createTextOutput('Bot OK');
}

function jsonOut(obj) {
  var o = ContentService.createTextOutput(JSON.stringify(obj));
  o.setMimeType(ContentService.MimeType.JSON);
  return o;
}

// ═══════════════ РАБОТА С ТАБЛИЦЕЙ ═══════════════

function getProducts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0] && !r[1]) continue;
    out.push({
      id: String(r[0]), name: String(r[1]), photo: String(r[2]),
      type: String(r[3]), description: String(r[4]), price: String(r[5])
    });
  }
  return out;
}

function getOwnerUsername() { return OWNER_USERNAME; }

function notifyOwnerFromWeb(data) {
  try {
    var item = data.item;
    var msg = '📩 <b>Запрос от покупателя!</b>\n\n' +
      '👤 <a href="tg://user?id=' + (data.userId||'0') + '">' + (data.userName||'Покупатель') + '</a>\n\n' +
      '📦 <b>' + item.name + '</b>\n💰 ' + item.price + '\n📝 ' + item.type + '\n🔖 ID: ' + item.id;
    sendMsg(OWNER_CHAT_ID, msg);
    return { success: true };
  } catch (err) { return { success: false }; }
}
