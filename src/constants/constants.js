require('dotenv').config();

module.exports = {
    MONGODB_URL_USERS: process.env.MONGODB_URL_USERS,
    MONGODB_URL_MESSAGES: process.env.MONGODB_URL_MESSAGES,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DEVELOPER_CHAT_URL: 'https://t.me/jobot_feedback'
};
