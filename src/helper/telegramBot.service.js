// services/telegramBot.js
const TelegramBot = require('node-telegram-bot-api');
const Menu = require('../models/menu.model');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });


// Store chat IDs to notify later
let chatSubscribers = new Set();

// Command: /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    chatSubscribers.add(chatId);
    // console.log('Received /start from chat id:', msg.chat.id);
    bot.sendMessage(chatId, "Welcome! Use /menu to see available items.");
});

// Command: /menu
bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    const items = await Menu.find({});

    if (!items.length) {
        return bot.sendMessage(chatId, "Menu is empty.");
    }

    let menuText = `📋 *Our Menu:*\n\n`;
    items.forEach((item, i) => {
        menuText += `${i + 1}. *${item.title}* - ${item.price} MMK\n`;
        if (item.description) menuText += `   ${item.description}\n`;
    });

    bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
});


// Function to notify all subscribers when menu changes
async function notifyMenuChange() {
    const items = await Menu.find({});
    // console.log("item---", items)
    let menuText = `📋 *Updated Menu:*\n\n`;
    items.forEach((item, i) => {
        menuText += `${i + 1}. *${item.title}* - ${item.price} MMK\n`;
    });

    for (const chatId of chatSubscribers) {
        bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
    }
}


module.exports = { bot, notifyMenuChange };
