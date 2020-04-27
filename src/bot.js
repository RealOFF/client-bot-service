const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const session = require('telegraf/session');
require('dotenv').config();

const {initMessageModel} = require('./models/message');
const {initUserModel} = require('./models/user');
const channelConfig = require('../channels-config.json');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
let Message;
let User;
initModels();

async function initModels(){
    Message = await initMessageModel();
    User = await initUserModel();
}

bot.use(session());

bot.start(async ({from, reply, session}) => {
    const newUser = await saveUser(from);
    let message;
    if (newUser) {
        message = `Привет, я тебя зарегистрировал.👍 Теперь ты можешь подписаться на интересующие тебя теги. Если хочешь больше информации, напиши "/help".`;
        session.user = newUser;
    } else {
        message = 'Ты уже зарегистрирован! 🤭';
    }
    reply(message);
});

bot.help(async ({reply}) => {
    const message = `У меня есть комманды:\n "/menu" - данная команда позволяет вызвать меню.\n "/settings" или "Изменить теги"(в меню) - данная команда позволяет настроить интересующие тебя теги. Выбери тег, который тебе необходим и тебе будут присылаться сообщения содержащие его.\n "/updates" или "Получить вакансии"(в меню) - данная команда присылает последние обновления постов.\n<i>Примечание: значение зарплаты может быть указано за час/день/месяц.</i>`;
    reply(message, {parse_mode: 'html'});
});

bot.settings(tagsSettingsCallback);

bot.command('updates', async (ctx) => {
    replyUpdatesCallback(ctx);
});

bot.command('menu', async ({reply}) => {
    reply('Меню', Markup
    .keyboard([
      ['Получить вакансии', 'Изменить теги'],
      ['Помощь', '👥 Обратная связь']
    ])
    .oneTime()
    .resize()
    .extra()
    )
});

bot.hears('Получить вакансии', async (ctx) => {
    replyUpdatesCallback(ctx);
});

bot.hears('Изменить теги', async (ctx) => {
    tagsSettingsCallback(ctx);
});

bot.hears('Помощь', async (ctx) => {
    helpCallback(ctx);
});

bot.hears('👥 Обратная связь', (ctx) => {
    ctx.reply('Сcылка на чат с разработчиками.', Markup.inlineKeyboard([Markup.urlButton('👥 Обратная связь', 'https://t.me/jobot_feedback')]).extra());
});

bot.on('callback_query', async ({reply, update, editMessageText, session, editMessageReplyMarkup}) => {
    const {from} = update.callback_query;
    const tag  = update.callback_query.data;
    const {id} = from;
    let user = await getUser(id, session);
    user = user ? user : await saveUser(from);
    if (channelConfig.tags.includes(tag)) {
        const newTags = user.newTags;
        if (user.newTags.includes(tag)) {
            session.user.newTags = newTags.filter((el) => el !== tag);
        } else {
            session.user.newTags.push(tag);
        }
        console.log('Tags updated');
        const chackedTags = session.user.newTags.map((userTag) => channelConfig.tags.indexOf(userTag));
        const keyboard = getTagsKeyboard(channelConfig.tags, chackedTags);
        const controlButtons = [
            Markup.callbackButton('Сохранить 💾','save_tags_query'), 
            Markup.callbackButton('Отменить ❌','cancel_tags_query')
        ];
        keyboard.push(controlButtons);
        try {
            await editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
        } catch(e) {
            console.error(e);
        }
    } else if (tag === 'save_tags_query') {
        const newTags = session.user.newTags;
        session.user.tags = newTags;
        await saveUserTags(id, newTags);
        editMessageText('Теги сохранены.');
    } else if (tag === 'cancel_tags_query') {
        session.user.newTags = session.user.tags;
        editMessageText('Теги не сохранены.');
    } else {
        console.log('Tag not exist');
        await reply('Что?????');
    }
});


bot.launch();

async function getMessages (tags) {    
    tags = tags.map(el => el.toLowerCase());
    const messages = await Message.find({tags: {$in: tags}});
    return messages;
}

async function getUser(id, session) {
    const user = session.user;
    if (!user || !user.tags) {
        console.log('Finding user in DB');
        const user = await User.findOne({id});
        session.user = user;
    }
    if (session.user && (!session.user.newTags || !session.user.newTags.length)) {
        session.user.newTags = session.user.tags;
    }
    return session.user;
}

async function saveUserTags (id, newTags) {
    await User.updateOne({id}, {$set: {tags: newTags}});
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
    const viewMessage = `<b>📫📫📫 Сообщение содержит теги: #${obj.tags.join(', #')}</b>\n<i>Читать далее по сслыке ⬇⬇⬇</i>\n\n <i>Ссылка:</i> ${obj.url}`;
    let salaryPart = '';

    if (obj.salary && obj.salary.value) {
            let period;

            switch(obj.salary.period) {
                case 'HOUR':
                    period = '/ Час';
                    break;
                case 'DAY':
                    period = '/ День';
                    break;
                case 'WEEK':
                    period = '/ Неделя';
                    break;
                default:
                    period = '';
            }
            const currency = obj.salary.currency || '';
            salaryPart = `\n <i>Зарплата🤑:</i> <b>${obj.salary.value} ${currency} ${period}</b>`;
    }
    return viewMessage + salaryPart;
}

async function saveUser({username, id}) {
    const isUserExist = !! await User.findOne({id});
    if (isUserExist) {
        return;
    }
    const user = User({
        id,
        name: username,
        tags: [],
    });
    await user.save();
    return user;
}

async function tagsSettingsCallback({reply, from, session}) {
    const user = await getUser(from.id, session);
    session.user.newTags = [...session.user.tags];
    const chackedTags = user.tags.map((userTag) => channelConfig.tags.indexOf(userTag));
    const keyboard = getTagsKeyboard(channelConfig.tags, chackedTags);
    const controlButtons = [
        Markup.callbackButton('Сохранить 💾', 'save_tags_query'),
        Markup.callbackButton('Отменить ❌', 'cancel_tags_query')
    ];
    keyboard.push(controlButtons);
    reply('Выбери интересющие теги. 🔖🔖🔖', Markup.inlineKeyboard(keyboard).extra());
}

async function replyUpdatesCallback({from, reply, session}) {
    const user = await getUser(from.id, session);

    if (!user) {
        await reply('Ты кто? Напиши "/start", чтобы зарегистрироваться.');
        return;
    }

    console.log('Start fetching messages');
    const postsInfo = await getMessages(user.tags);
    const includedTags = [];

    for (postInfo of postsInfo) {
        const postMessage = renderPostMessage(postInfo);
        await reply(postMessage, {parse_mode: 'html'});
        includedTags.push(...postInfo.tags)
    };
    const excludedTags = user.tags.filter((tag) => !includedTags.includes(tag.toLowerCase()));
    const uniqExcludedTags = excludedTags.filter((tag, index, self) => self.indexOf(tag) === index);
    if (uniqExcludedTags.length) {
        await reply(`К сожалению, по тегам: ${uniqExcludedTags.join(', ')} – нет обновлений. 😢`);
    }
}

async function helpCallback({reply}) {
    const message = `У меня есть комманды:\n "/menu" - данная команда позволяет вызвать меню.\n "/settings" или "Изменить теги"(в меню) - данная команда позволяет настроить интересующие тебя теги. Выбери тег, который тебе необходим и тебе будут присылаться сообщения содержащие его.\n "/update" или "Получить вакансии"(в меню) - данная команда присылает последние обновления постов.\n<i>Примечание: значение зарплаты может быть указано за час/день/месяц.</i>`;
    reply(message, {parse_mode: 'html'});
}
