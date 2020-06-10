const session = require('telegraf/session');
const Telegraf = require('telegraf');

const {
    createStartHandler,
    createHelpHandler,
    createSettingsHandler,
    createUpdateHandler,
    createMenuHandler,
    createCallbackQueryHandler,
    createFeedbackHandler
} = require('./controller/handlers');
const {User} = require('./model/user');
const {Message} = require('./model/message');
const messagePackages = require('./view/messages/index');
const queries = require('./query-names');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const userModel = new User();
userModel.init(process.env.MONGODB_URL_USERS);
const messageModel = new Message();
messageModel.init(process.env.MONGODB_URL_MESSAGES);

const startHandler = createStartHandler(messagePackages, {userModel});
const helpHandler = createHelpHandler(messagePackages);
const settingsHandler = createSettingsHandler(messagePackages, {userModel},{queries});
const updateHandler = createUpdateHandler(messagePackages, {userModel, messageModel});
const menuHandler = createMenuHandler(messagePackages);
const callbackQueryHandler = createCallbackQueryHandler(messagePackages, {userModel},{queries});
const feedbackHandler = createFeedbackHandler(messagePackages);

bot.use(session());

bot.start(startHandler);
bot.help(helpHandler);
bot.settings(settingsHandler);
bot.command('updates', updateHandler);
bot.command('menu', menuHandler);

bot.hears('Получить вакансии', updateHandler);
bot.hears('Изменить теги', settingsHandler);
bot.hears('Помощь', helpHandler);
bot.hears('👥 Обратная связь', feedbackHandler);

bot.on(queries.callbackQuery, callbackQueryHandler);


bot.launch();