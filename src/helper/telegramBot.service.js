const TelegramBot = require('node-telegram-bot-api');
const Menu = require('../models/menu.model');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// In-memory chat subscribers (consider persisting to DB in production)
const chatSubscribers = new Set();

// Cache menu items for 60 seconds to reduce DB load
let cachedMenu = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

// Helper: fetch menu with caching
async function getCachedMenu() {
    const now = Date.now();
    if (cachedMenu && now - cacheTimestamp < CACHE_TTL_MS) {
        return cachedMenu;
    }
    cachedMenu = await Menu.find({ available: true, isDeleted: false }).sort({ title: 1 }).lean();
    cacheTimestamp = now;
    return cachedMenu;
}

// Helper: format menu text for Telegram markdown
function formatMenuText(items) {
    if (!items.length) return "Menu is empty.";
    let text = "📋 *Our Menu:*\n\n";
    items.forEach((item, i) => {
        text += `${i + 1}. *${item.title}* - ${item.price} MMK\n`;
        if (item.description) text += `   ${item.description}\n`;
    });
    return text;
}

// Save chatId subscriber (can be expanded to persistent DB)
function addSubscriber(chatId) {
    chatSubscribers.add(chatId);
}

// Check chat type (private, group, supergroup)
function isChatSupported(chatType) {
    return ['private', 'group', 'supergroup'].includes(chatType);
}

// Respond to /start command (handle groups differently)
bot.onText(/\/start(@\w+)?/, (msg) => {
    if (!isChatSupported(msg.chat.type)) return;

    addSubscriber(msg.chat.id);

    const welcomeMsg = msg.chat.type === 'private'
        ? "Welcome! Use /menu to see available items."
        : "Hello group! Use /menu to get the menu.";

    bot.sendMessage(msg.chat.id, welcomeMsg).catch(console.error);
});

// Respond to /menu command (with caching and error handling)
bot.onText(/\/menu(@\w+)?/, async (msg) => {
    if (!isChatSupported(msg.chat.type)) return;

    try {
        const menuItems = await getCachedMenu();
        const menuText = formatMenuText(menuItems);
        await bot.sendMessage(msg.chat.id, menuText, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error fetching menu:', error);
        bot.sendMessage(msg.chat.id, 'Sorry, failed to fetch the menu. Please try again later.');
    }
});

// Error logging for polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code, error.response?.body || error.message);
});

// Notify subscribers with optional rate-limiting (simple debounce example)
let notifyTimeout = null;
async function notifyMenuChange() {
    try {
        const menuItems = await getCachedMenu();
        const menuText = `📋 *Updated Menu:*\n\n` + menuItems.map((item, i) =>
            `${i + 1}. *${item.title}* - ${item.price} MMK`
        ).join('\n');

        // Simple rate limit: batch notifications if called multiple times quickly
        if (notifyTimeout) return;

        notifyTimeout = setTimeout(async () => {
            for (const chatId of chatSubscribers) {
                try {
                    await bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
                } catch (err) {
                    console.error(`Failed to send update to chat ${chatId}:`, err.message);
                }
            }
            notifyTimeout = null;
        }, 5000);
    } catch (error) {
        console.error('Error notifying menu change:', error);
    }
}

module.exports = { bot, notifyMenuChange };
