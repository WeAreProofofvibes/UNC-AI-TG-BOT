import TelegramBot from "node-telegram-bot-api";

// Singleton pattern for bot instance
const createBot = () => {
    if (global.bot) {
        return global.bot;
    }

    const isDev = process.env.NODE_ENV === 'development';
    const options = {
        polling: isDev,
        webHook: !isDev,
        // Modern options for better performance
        onlyFirstMatch: true,
        filepath: false,
    };

    try {
        if (isDev) {
            global.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
            console.log('Bot initialized in development mode with polling');
        } else {
            const url = process.env.VERCEL_URL || process.env.APP_URL;
            const webhookUrl = `${url}/api/telegram`;
            
            global.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
                webHook: {
                    port: 443,
                    host: '0.0.0.0',
                    max_connections: parseInt(process.env.MAX_CONNECTIONS || '40'),
                },
            });

            // Set up webhook with additional options
            global.bot.setWebHook(webhookUrl, {
                max_connections: parseInt(process.env.MAX_CONNECTIONS || '40'),
                drop_pending_updates: process.env.DROP_PENDING_UPDATES === 'true',
                secret_token: process.env.WEBHOOK_SECRET,
            }).then(() => {
                console.log('Webhook set:', webhookUrl);
                // Verify webhook info
                return global.bot.getWebHookInfo();
            }).then((info) => {
                console.log('Webhook info:', JSON.stringify(info, null, 2));
            }).catch((error) => {
                console.error('Webhook setup error:', error);
            });
        }

        return global.bot;
    } catch (error) {
        console.error('Error initializing bot:', error);
        throw error;
    }
};

// Initialize bot
const bot = createBot();

// Street-smart welcome messages for new members
const ADVICE_LIST = [
    "Let me put you on some game youngblood: Closed mouths don't get fed. Speak up! 🗣️",
    "Real recognize real. Introduce yourself, fam! 💯",
    "Pressure makes diamonds. Stay solid youngblood! 💎",
    "Ain't nothing to it but to do it. Take action today! 🚀",
    "Respect is currency. Give it, and you'll get it back tenfold. 🤝",
    "A wise man once said: 'Your network is your net worth.' Who you building with? 🌐",
    "Stay true to the game, but level up your mindset. That's how you win! 🏆",
    "Knowledge is power, but execution is king. What's your move? 👑",
    "Every expert was once a beginner. Welcome to the journey! 🌟"
];

// Test the random message selection
console.log('Testing ADVICE_LIST - Random message:', ADVICE_LIST[Math.floor(Math.random() * ADVICE_LIST.length)]);

bot.on("new_chat_members", async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.new_chat_members[0]?.first_name || "YN";
    const advice = ADVICE_LIST[Math.floor(Math.random() * ADVICE_LIST.length)];
    
    try {
        await bot.sendMessage(
            chatId,
            `Yo ${firstName}, welcome to the spot! 🎉\n\n${advice}\n\nDrop an intro—who you be?`
        );
    } catch (error) {
        console.error('Error sending welcome message:', error);
        // Try to send a simpler message if the first one fails
        try {
            await bot.sendMessage(
                chatId,
                `Welcome ${firstName}! 🎉 Drop an intro!`
            );
        } catch (retryError) {
            console.error('Error sending fallback welcome message:', retryError);
        }
    }
});

// *** COMBINED MESSAGE HANDLER ***
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    try {
        // Check for commands FIRST
        if (userMessage.startsWith('/start')) {
            bot.sendMessage(
                chatId, 
                `*Welcome to UNC.AI* 🚀

I'm your AI guide, here to help you navigate the wisdom of UNC. Through our platform, you'll gain insights on the four key pillars: Faith, Finances, Fitness, and Family.

Type /help to see what I can do for you! 💯`,
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/help')) {
            const helpText = `
*Available Commands* 📱

🎯 *Core Commands*
/start - Get started with UNC.AI
/help - View all available commands
/about - Learn about our mission

🌐 *Community*
/socials - Connect with our community
/website - Visit our official website
/info - Latest updates and news

❓ *Information*
/faq - Frequently asked questions
/price - Check token price
/contract - View contract address

_For anything else, just ask and I'll keep it real with you!_ 💯
            `;
            bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
            return;
        } else if (userMessage.startsWith('/price')) {
            await bot.sendChatAction(chatId, 'typing');
            const price = await getTokenPrice();
            bot.sendMessage(
                chatId, 
                `*Current UNC Token Price:* $${price}\n\n_Updated in real-time_ 📈`, 
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/about')) {
            bot.sendMessage(
                chatId, 
                `*About UNC.AI* 🌟

UNC.AI is a revolutionary wisdom-sharing platform powered by the Ultimate Nexus Catalyst (UNC), a visionary who emerged from the streets of Philadelphia to become a beacon of transformation.

*Our Four Pillars:*
🙏 *Faith* - Spiritual growth and inner wisdom
💰 *Finances* - Building sustainable wealth
💪 *Fitness* - Physical and mental strength
👨‍👩‍👧‍👦 *Family* - Nurturing relationships and legacy

Through our unique AI-powered interface, we're bridging street smarts with cutting-edge technology to create a community of growth and transformation.

_Join us on this journey of elevation._ 🚀`,
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/socials')) {
            const socialsText = `
*Connect with the UNC.AI Community* 🌐

🐦 *Twitter:* [@TheRealUNC_AI](https://twitter.com/TheRealUNC_AI)
💬 *Telegram:* [UNC.AI Community](https://t.me/UNCAI_Community)
🤝 *Discord:* Coming Soon

_Join the movement and level up with us!_ 💯

Stay connected for daily wisdom, community updates, and exclusive content. 🎯
            `;
            bot.sendMessage(chatId, socialsText, { parse_mode: 'Markdown' });
            return;
        } else if (userMessage.startsWith('/website')) {
            bot.sendMessage(
                chatId, 
                `*Visit Our Official Website* 🌐

[UNC.AI Official Website](https://unc.ai)

_Explore our platform and start your journey of transformation._ 🚀`,
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/contract')) {
            bot.sendMessage(
                chatId,
                `*UNC Token Contract* 🔐

Contract Address:
\`Coming Soon\`

_Always verify the contract address and trade safely!_ ✅`,
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/info')) {
            bot.sendMessage(
                chatId,
                `*Latest UNC.AI Updates* 📢

🔥 *Recent Developments:*
• AI-powered wisdom sharing platform launched
• Growing community of forward-thinkers
• New features and integrations in development
• Expanding our reach and impact

🚀 *Coming Soon:*
• Enhanced AI interactions
• Community events and workshops
• Exclusive content and insights
• Token utility features

_Stay tuned for more updates as we continue to grow!_ 💯`,
                { parse_mode: 'Markdown' }
            );
            return;
        } else if (userMessage.startsWith('/faq')) {
            bot.sendMessage(
                chatId,
                `*Frequently Asked Questions* ❓

*Q: What is UNC.AI?*
A: We're a wisdom-sharing platform combining street smarts with AI technology, guided by UNC's principles of Faith, Finances, Fitness, and Family 🌟

*Q: How can I get involved?*
A: Join our Telegram community, follow us on Twitter, and interact with our AI bot to start your journey 🚀

*Q: What makes UNC.AI unique?*
A: We bridge real-world wisdom with cutting-edge AI, creating a unique blend of street smarts and technology 💡

*Q: How does the AI bot work?*
A: Our AI is trained to provide guidance aligned with UNC's principles, offering both practical advice and strategic insights 🤖

_Have more questions? Just ask and I'll keep it real with you!_ 💯`,
                { parse_mode: 'Markdown' }
            );
            return;
        }

        // If NO command is matched, THEN send to AI
        await bot.sendChatAction(chatId, 'typing');
        const response = await fetch('https://api.groq.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a helpful and street-smart AI assistant. Use casual, urban language but stay professional and informative." },
                    { role: "user", content: userMessage }
                ],
                model: "mixtral-8x7b-32768",
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        const completion = await response.json();
        const aiResponse = completion.choices[0]?.message?.content || "My bad, I couldn't process that.";
        await bot.sendMessage(chatId, aiResponse);

    } catch (error) {
        console.error('Error handling message:', error);
        await bot.sendMessage(chatId, "My bad, something went wrong. Try again later!");
    }
}); // *** END OF COMBINED MESSAGE HANDLER ***

export default async function handler(req, res) {
    // Verify webhook secret if provided
    const secretHash = req.headers['x-telegram-bot-api-secret-token'];
    if (process.env.WEBHOOK_SECRET && secretHash !== process.env.WEBHOOK_SECRET) {
        console.error('Invalid webhook secret');
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            console.log('Received webhook:', JSON.stringify(req.body, null, 2));
            
            const { body } = req;
            if (!body || !body.message) {
                console.warn('No message in webhook body');
                return res.status(400).json({ error: 'No message in request body' });
            }

            // Process the update
            await bot.processUpdate(body);
            console.log('Successfully processed update for chat:', body.message.chat.id);
            
            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ 
                error: 'Failed to process update',
                details: error.message 
            });
        }
    } else if (req.method === 'GET') {
        // Health check endpoint
        try {
            const webhookInfo = await bot.getWebHookInfo();
            return res.status(200).json({ 
                message: "UNC AI Telegram Bot Status",
                environment: process.env.NODE_ENV,
                webhook: {
                    url: webhookInfo.url,
                    hasCustomCertificate: webhookInfo.has_custom_certificate,
                    pendingUpdateCount: webhookInfo.pending_update_count,
                    lastErrorDate: webhookInfo.last_error_date,
                    lastErrorMessage: webhookInfo.last_error_message,
                    maxConnections: webhookInfo.max_connections,
                },
                status: 'active'
            });
        } catch (error) {
            console.error('Error getting webhook info:', error);
            return res.status(500).json({ 
                error: 'Failed to get webhook info',
                details: error.message 
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// Add more specific configuration
export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
};

async function getTokenPrice() {
    // Implement your actual logic to fetch the token price.
    return 1.23; // Placeholder
}