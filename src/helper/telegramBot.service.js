const TelegramBot = require('node-telegram-bot-api');
const Menu = require('../models/menu.model');
const Subscriber = require('../models/subscriber.model');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const chatSubscribers = new Set();
async function loadSubscribers() {
    const docs = await Subscriber.find({});
    docs.forEach(doc => chatSubscribers.add(doc.chatId));
}
loadSubscribers();

function addSubscriber(chatId) {
    chatSubscribers.add(chatId);
    Subscriber.updateOne({ chatId }, { chatId }, { upsert: true }).exec();
}

async function getMenu() {
    return await Menu.find({});
}

function formatMenuByCategory(items) {
    if (!items.length) return "📭 *Menu is empty.*";

    const grouped = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    let text = "📋 *Our Menu*\n━━━━━━━━━━━━━━\n\n";

    for (const [category, categoryItems] of Object.entries(grouped)) {
        text += `💠 *${category}*\n`;
        text += "━━━━━━━━━━\n";

        categoryItems.forEach(item => {
            if (item.variants && item.variants.length) {
                const variantText = item.variants
                    .map(v => `_${v.variant}_ — ${v.price} MMK`)
                    .join(" | ");
                text += `• *${item.title}*\n   ${variantText}\n`;
            } else {
                text += `• *${item.title}* — ${item.price || 'N/A'} MMK\n`;
            }

            if (item.description) {
                text += `   _${item.description}_\n`;
            }
        });

        text += "\n";
    }

    return text.trim();
}

bot.onText(/\/start(@\w+)?/, (msg) => {
    if (!['private', 'group', 'supergroup'].includes(msg.chat.type)) return;

    addSubscriber(msg.chat.id);

    const welcomeMsg = msg.chat.type === 'private'
        ? "Welcome! Use /menu to see available items."
        : "Hello group! Use /menu to get the menu.";

    bot.sendMessage(msg.chat.id, welcomeMsg).catch(console.error);
});

bot.onText(/\/menu(@\w+)?/, async (msg) => {
    if (!['private', 'group', 'supergroup'].includes(msg.chat.type)) return;

    try {
        const menuItems = await getMenu();
        const menuText = formatMenuByCategory(menuItems);
        await bot.sendMessage(msg.chat.id, menuText, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error fetching menu:', error);
        bot.sendMessage(msg.chat.id, 'Sorry, failed to fetch the menu. Please try again later.');
    }
});

async function notifyMenuChange() {
    try {
        const menuItems = await getMenu();
        const menuText = formatMenuByCategory(menuItems);
        for (const chatId of chatSubscribers) {
            try {
                await bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
            } catch (err) {
                console.error(`Failed to send update to chat ${chatId}:`, err.message);
            }
        }
        console.log("Menu update sent to all subscribers.");
    } catch (error) {
        console.error('Error notifying menu change:', error);
    }
}

module.exports = { bot, notifyMenuChange };
