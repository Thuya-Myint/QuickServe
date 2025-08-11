const TelegramBot = require('node-telegram-bot-api');
const Menu = require('../models/menu.model');
const Subscriber = require('../models/subscriber.model')

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// In-memory chat subscribers (consider persisting to DB in production)
const chatSubscribers = new Set();
async function loadSubscribers() {
    const docs = await Subscriber.find({});
    docs.forEach(doc => chatSubscribers.add(doc.chatId));
}

function addSubscriber(chatId) {
    chatSubscribers.add(chatId);
    Subscriber.updateOne({ chatId }, { chatId }, { upsert: true }).exec();
}
loadSubscribers();
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
    cachedMenu = await Menu.find({});
    cacheTimestamp = now;
    return cachedMenu;
}


// Helper: format menu grouped by category
function formatMenuByCategory(items) {
    if (!items.length) return "📭 *Menu is empty.*";

    // Group items by category
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
                // Show variants inline
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

        text += "\n"; // space between categories
    }

    return text.trim();
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
        const menuText = formatMenuByCategory(menuItems);
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
let notifyPending = false;



// async function notifyMenuChange() {
//     try {
//         notifyPending = true; // Mark notification requested

//         // Clear previous timeout so we debounce properly
//         if (notifyTimeout) {
//             clearTimeout(notifyTimeout);
//         }

//         notifyTimeout = setTimeout(async () => {
//             if (!notifyPending) {
//                 notifyTimeout = null;
//                 return;
//             }

//             notifyPending = false;

//             const menuItems = await getCachedMenu();
//             const menuText = `📋 *Updated Menu:*\n\n` + menuItems.map((item, i) =>
//                 `${i + 1}. *${item.title}* - ${item.price} MMK`
//             ).join('\n');

//             for (const chatId of chatSubscribers) {
//                 try {
//                     await bot.sendMessage(chatId, menuText, { parse_mode: 'Markdown' });
//                 } catch (err) {
//                     console.error(`Failed to send update to chat ${chatId}:`, err.message);
//                 }
//             }
//             console.log(" will be notifed")
//             notifyTimeout = null;

//             // If a new notification was requested during send, schedule again
//             if (notifyPending) {
//                 console.log(" will be notifed")
//                 notifyMenuChange();
//             }
//         }, 2000);

//     } catch (error) {
//         console.error('Error notifying menu change:', error);
//     }
// }

async function notifyMenuChange() {
    try {
        const menuItems = await getCachedMenu();
        // console.log("dfaewr---------", menuItems)
        const menuText = `📋 *Updated Menu:*\n\n` + menuItems.map((item, i) =>
            `${i + 1}. *${(item.title)}* - ${item.price} MMK`

        ).join('\n');

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
