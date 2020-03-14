const mongoose = require('mongoose');
const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const session = require('telegraf/session');
require('dotenv').config();

const MessageSchema = require('./models/message');
const UserSchema = require('./models/user');
const channelConfig = require('../channels-config.json');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());

async function saveUser(chatId, name) {
    const dbURL = process.env.MONGODB_URL_USERS;
    const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
    console.log('User DB connected')
    const User = usersDBConnection.model('user', UserSchema);
    const isUserExist = !! await User.find({chatId});
    if (isUserExist) {
        usersDBConnection.close();
        return;
    }
    const user = User();
    user.chatId = chatId;
    user.name = name;
    await user.save();
    usersDBConnection.close();
    return user;
}

bot.start(async ({message, reply, session}) => {
    const chatId = message.chat.id;
    const name = message.chat.username;
    const newUser = await saveUser(chatId, name);
    if (newUser) {
        message = `Привет, я тебя зарегестрировал.👍 Теперь ты можешь подписаться на интересующие тебя теги. Если хочешь больше информации, напиши "/help".`;
        session.user = user;
    } else {
        message = 'Ты уже зарегестрирован! 🤭';
    }
    reply(message);
});

bot.help(async ({reply}) => {
    const message = `У меня есть комманды:\n"/settings" - данная команда позволяет настроить интересующие тебя теги. Выбери тег, который тебе необходим и тебе будут присылаться сообщения содержащие его.\n "/update" - данная команда присылает последние обновления постов.\n<i>Примечание: значиение зарплаты может быть указано за час/день/месяц.</i>`;
    reply(message);
});

bot.settings(async ({reply, message, session}) => {
    const user = await getUser(message.chat.id, session);
    session.user.oldTags = session.user.tags;
    const chackedTags = user.tags.map((userTag) => channelConfig.tags.indexOf(userTag));
    const keyboard = getTagsKeyboard(channelConfig.tags, chackedTags);
    const controlButtons = [
        Markup.callbackButton('Сохранить 💾', 'save_tags_query'),
        Markup.callbackButton('Отменить ❌', 'cancel_tags_query')
    ];
    keyboard.push(controlButtons);
    reply('Выбери интересющие теги. 🔖🔖🔖', Markup.inlineKeyboard(keyboard).extra());
});

bot.command('update', async ({message, reply, session}) => {
   const user = await getUser(message.chat.id, session);
    console.log('Start fetch messages');
    const postsInfo = await getMessages(user.tags);
    const includedTags = [];
    for (postInfo of postsInfo) {
        await reply(renderPostMessage(postInfo), {parse_mode: 'html'});
        includedTags.push(...postInfo.tags)
    };
    const excludedTags = user.tags.filter((tag) => !includedTags.includes(tag));
    const uniqExcludedTags = excludedTags.filter((tag, index, self) => self.indexOf(tag) === index);
    if (uniqExcludedTags.length) {
        await reply(`К сожалению по тегам: ${uniqExcludedTags.join(', ')} – нет обновлений. 😢`);
    }
});

bot.on('callback_query', async ({reply, update, editMessageText, session, editMessageReplyMarkup}) => {
    const tag  = update.callback_query.data;
    const chatId = update.callback_query.message.chat.id;
    const user = await getUser(chatId, session);

    if (channelConfig.tags.includes(tag)) {
        const newTags = user.tags;
        if (user.tags.includes(tag)) {
            session.user.tags = newTags.filter((el) => el !== tag);
        } else {
            session.user.tags = [...newTags, tag];
        }
        console.log('Tags updated');
        const chackedTags = session.user.tags.map((userTag) => channelConfig.tags.indexOf(userTag));
        const keyboard = getTagsKeyboard(channelConfig.tags, chackedTags);
        const controlButtons = [
            Markup.callbackButton('Сохранить 💾','save_tags_query'), 
            Markup.callbackButton('Отменить ❌','cancel_tags_query')
        ];
        keyboard.push(controlButtons);
        await editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
    } else if (tag === 'save_tags_query') {
        const newTags = session.user.tags;
        await saveUserTags(chatId, newTags);
        editMessageText('Теги сохранены.');
    } else if (tag === 'cancel_tags_query') {
        session.user.tags = session.user.oldTags;
        editMessageText('Теги не сохранены.');
    } else {
        console.log('Tag not exist');
        await reply('Что?????');
    }
   });


bot.launch();


async function getMessages (tags) {
    const dbURL = process.env.MONGODB_URL_MESSAGES;
    const messagesDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
    const Message = messagesDBConnection.model('message', MessageSchema);
    const messages = await Message.find({tags: {$in: tags}});
    messagesDBConnection.close();
    return messages;
}

async function getUser(chatId, session) {
    const sessionUser = session.user;
    if (sessionUser && sessionUser.tags) {
        return sessionUser;
    } 
    const dbURL = process.env.MONGODB_URL_USERS;
    const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
    const User = usersDBConnection.model('user', UserSchema);
    const user = await User.findOne({chatId});
    usersDBConnection.close();
    session.user = user;
    return user;
}

async function saveUserTags (chatId, newTags) {
    const dbURL = process.env.MONGODB_URL_USERS;
    const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
    const User = usersDBConnection.model('user', UserSchema);
    User.updateOne({chatId}, {$set: {tags: newTags}});
}

function getTagsKeyboard(tags, chackedTags) {
    const grid = [];
    for(let i = 0; i < tags.length; i++) {
        if (i % 3 === 0) {
            grid.push([]);
        }
        text = tags[i] + (chackedTags.includes(i) ? ' ✅' : '');
        grid[Math.floor(i / 3)][i % 3] = Markup.callbackButton(text, tags[i]);
    }
    return grid;
}

function renderPostMessage(obj) {
    const viewMessage = `<b>📫📫📫 Сообщение содержит теги #${obj.tags.join(', #')}</b>\n<i>Читать далее по сслыке ⬇⬇⬇</i>\n\n <i>Ссылка:</i> ${obj.url}`
    const salaryPart = obj.salary && obj.salary.value ? 
        `\n <i>Зарплата:</i> <b>${obj.salary.value} ${obj.salary.currency}</b>` :
        '';
    return viewMessage + salaryPart;
}
