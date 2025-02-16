// pages/api/telegram.js
import TelegramBot from "node-telegram-bot-api";

// Initialize bot outside of the handler
let bot;

// Initialize bot if it hasn't been initialized yet
if (!bot) {
  // Check if we're in development
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development - use long polling
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('Bot initialized in development mode with polling');
  } else {
    // Production - use webhook
    const url = process.env.VERCEL_URL || process.env.APP_URL;
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    bot.setWebHook(`${url}/api/telegram`);
    console.log('Bot initialized in production mode with webhook');
  }

  // List of positive advice messages
  const ADVICE_LIST = [
    "Let me put you on some game youngblood: Closed mouths don't get fed. Speak up!",
    "Real recognize real. Introduce yourself, fam!",
    "Pressure makes diamonds. Stay solid youngblood!",
    "Ain't nothing to it but to do it. Take action today!",
    "Respect is currency. Give it, and you'll get it back tenfold.",
    "A wise man once said: 'Your network is your net worth.' Who you building with?",
  ];

  // Handle new members joining
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
    }
  });

  // Handle messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    try {
      // Show typing indicator
      await bot.sendChatAction(chatId, 'typing');

      // Get AI response using Groq API
      const response = await fetch('https://api.groq.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a helpful and street-smart AI assistant. Use casual, urban language but stay professional and informative."
            },
            {
              role: "user",
              content: userMessage
            }
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
  });
}

// API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Handle webhook update
      const { body } = req;
      if (body.message) {
        const { message } = body;
        // Process the message
        await bot.processUpdate({ message });
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Failed to process update' });
    }
  } else {
    // Handle GET request
    res.status(200).json({ 
      message: "Unc AI Telegram Bot is running!",
      environment: process.env.NODE_ENV,
      webhook: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled (using polling)'
    });
  }
}

// Configure body parsing
export const config = {
  api: {
    bodyParser: true,
  },
};
