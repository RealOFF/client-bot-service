const session = require('telegraf/session');
const Telegraf = require('telegraf');

const {
    MONGODB_URL_USERS,
    MONGODB_URL_MESSAGES,
    TELEGRAM_BOT_TOKEN,
    DEVELOPER_CHAT_URL
} = require('./constants/constants');

const {
    createStartHandler,
    createHelpHandler,
    createSettingsHandler,
    createUpdateHandler,
    createMenuHandler,
    createCallbackQueryHandler,
    createFeedbackHandler
} = require('./controllers/handlers');

const {
    Message,
    User
} = require('./models/index');

const {getHears} = require('./utils/hears-utils');

const vocabularyPackages = require('./constants/vocabulary/index');
const queries = require('./constants/query-names');

const userModel = new User();
userModel.init(MONGODB_URL_USERS);
const messageModel = new Message();
messageModel.init(MONGODB_URL_MESSAGES);

const {
    createBadQueryMessageRenderer,
    createFeedbackLinkRenderer,
    createHelpMessageRenderer,
    createJobMessageRenderer,
    createMenuKeyboardRenderer,
    createNewUserMessageRenderer,
    createNoUpdatesMessageRenderer,
    createTagsKeyboardRenderer,
    createTagsNotSavedMessageRenderer,
    createTagsSavedMessageRenderer,
    createUnknownUserMessageRenderer,
    createUserExistMessageRenderer
} = require('./views/templates/index');

const renderBadQueryMessage = createBadQueryMessageRenderer(vocabularyPackages);
const renderFeedbackLink = createFeedbackLinkRenderer(
    vocabularyPackages,
    {url: DEVELOPER_CHAT_URL}
);
const renderHelpMessage = createHelpMessageRenderer(vocabularyPackages);
const renderJobMessage = createJobMessageRenderer(vocabularyPackages);
const renderMenuKeyboard = createMenuKeyboardRenderer(vocabularyPackages);
const renderNewUserMessage = createNewUserMessageRenderer(vocabularyPackages);
const renderNoUpdatesMessage = createNoUpdatesMessageRenderer(vocabularyPackages);
const renderTagsKeyboard = createTagsKeyboardRenderer(vocabularyPackages);
const renderTagsNotSavedMessage = createTagsNotSavedMessageRenderer(vocabularyPackages);
const renderTagsSavedMessage = createTagsSavedMessageRenderer(vocabularyPackages);
const renderUnknownUserMessage = createUnknownUserMessageRenderer(vocabularyPackages);
const renderUserExistMessage = createUserExistMessageRenderer(vocabularyPackages);


const startHandler = createStartHandler({
    renderNewUserMessage,
    renderUserExistMessage
}, {userModel});
const helpHandler = createHelpHandler({renderHelpMessage});
const settingsHandler = createSettingsHandler({
    renderTagsKeyboard 
}, {userModel}, {queries});
const updateHandler = createUpdateHandler({
    renderUnknownUserMessage,
    renderJobMessage,
    renderNoUpdatesMessage
}, {
    userModel,
    messageModel
});
const menuHandler = createMenuHandler({renderMenuKeyboard});
const callbackQueryHandler = createCallbackQueryHandler({
    renderTagsKeyboard,
    renderTagsSavedMessage,
    renderTagsNotSavedMessage,
    renderBadQueryMessage
}, {userModel}, {queries});
const feedbackHandler = createFeedbackHandler({renderFeedbackLink});

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.use(session());

bot.start(startHandler);
bot.help(helpHandler);
bot.settings(settingsHandler);
bot.command('updates', updateHandler);
bot.command('menu', menuHandler);

bot.hears(getHears(vocabularyPackages, 'getJobsText'), updateHandler);
bot.hears(getHears(vocabularyPackages, 'changeTagsText'), settingsHandler);
bot.hears(getHears(vocabularyPackages, 'helpWord'), helpHandler);
bot.hears(getHears(vocabularyPackages, 'feedbackText'), feedbackHandler);

bot.on(queries.callbackQuery, callbackQueryHandler);

bot.launch();
