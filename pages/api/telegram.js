import TelegramBot from "node-telegram-bot-api";
import llamaConfig from "../../config/llm.config";

// Replace with your Telegram bot token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// List of positive advice messages
const ADVICE_LIST = [
  "Let me put you on some game youngblood: Closed mouths don't get fed. Speak up!",
  "Real recognize real. Introduce yourself, fam!",
  "Pressure makes diamonds. Stay solid youngblood!",
  "Ain't nothing to it but to do it. Take action today!",
  "Respect is currency. Give it, and you'll get it back tenfold.",
  "A wise man once said: 'Your network is your net worth.' Who you building with?",
];

// Initialize LLM configuration
const llmConfig = {
  ...llamaConfig,
  temperature: 0.7,
  max_tokens: 1000
};

// Function to get AI response
async function getAIResponse(message) {
  try {
    // Here you would implement the actual API call to your LLM service
    // For now, we'll return a placeholder response
    return `AI Response to: ${message}\nUsing model: ${llmConfig.model}`;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I apologize, but I'm having trouble processing your request right now.";
  }
}

// Listen for new members joining
bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.new_chat_members[0]?.first_name || "YN";
  const advice = ADVICE_LIST[Math.floor(Math.random() * ADVICE_LIST.length)];

  await bot.sendMessage(
    chatId,
    `Yo ${firstName}, welcome to the spot! 🎉\n\n${advice}\n\nDrop an intro—who you be?`
  );
});

// Listen for messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Don't respond to empty messages
  if (!userMessage) return;

  try {
    // Get AI response
    const aiResponse = await getAIResponse(userMessage);
    
    // Send the response back to the user
    await bot.sendMessage(chatId, aiResponse);
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(chatId, "My bad, something went wrong. Try again later!");
  }
});

export default function handler(req, res) {
  res.status(200).json({ 
    message: "Unc AI Telegram Bot is running!",
    model: llmConfig.model
  });
}
