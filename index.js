const mongoose = require('mongoose');
const Slimbot = require('slimbot');

const MessageSchema = require('./models/message');
const UserSchema = require('./models/user');
const databaseConfig = require('./database-config.json');
const botConfig = require('./bot-config');
const channelConfig = require('./channels-config.json');

const slimbot = new Slimbot(botConfig.token);

async function getMessages (tags) {
    const dbURL = process.env.MONGODB_URL_MESSAGES;
    const messagesDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
    const Message = messagesDBConnection.model('message', MessageSchema);
    const messages = await Message.find({tags: {$in: tags}});
    messagesDBConnection.close();
    console.log(messages)
    return messages;
} 

slimbot.on('message',async userMessage => {
    switch(userMessage.text) {
        case '/start':
            const dbURL = process.env.MONGODB_URL_USERS;
            const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
            console.log('User DB connected')
            const User = usersDBConnection.model('user', UserSchema);
            const user = User();
            user.chatId = userMessage.chat.id;
            await user.save();
            const greeting = `Привет, я тебя зарегестрировал. 
            Теперь ты можешь подписаться на интересующие тебя теги. 
            Если хочешь больше информации, напиши "/help"`;
            slimbot.sendMessage(userMessage.chat.id, greeting);
            return; //todo check user is exist?
        case '/update':
            const dbURL = process.env.MONGODB_URL_USERS;
            const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
            const User = usersDBConnection.model('user', UserSchema);
            const user = await User.findOne({chatId: userMessage.chat.id});
            usersDBConnection.close();
            console.log('Start fetch messages');
            const messages = await getMessages(user.tags);
            const includedTags = [];
            messages.forEach((obj) => {
                slimbot.sendMessage(userMessage.chat.id, getPostMessage(obj), {parse_mode: 'html'});
                includedTags.push(obj.tags)
            });
            const excludedTags = user.tags.filter((tag) => !includedTags.includes(tag));
            slimbot.sendMessage(userMessage.chat.id, `К сожалению по тегам: ${excludedTags.join(' ,')} – нет обновлений.`);
            return;
        case '/settings':
            const optionalParams = {
                parse_mode: 'html',
                reply_markup: JSON.stringify({
                inline_keyboard: getInlineKeyboard(channelConfig.tags)
                }),
            };
            slimbot.sendMessage(userMessage.chat.id, 'Выберите интересющие вас теги.', optionalParams);
            return;
        case '/help':
            const message = `У меня есть комманты:\n
            "/settings" - данная команда позволяет настроить интересующие тебя теги. Выбери тег, который тебе необходим
            и тебе будут присылаться сообщения содержащие его.\n
            "/update" - данная команда присылает последние обновления постов.`;
            slimbot.sendMessage(userMessage.chat.id, message);
            return;
    }

    if (userText[0] === '/') {
        slimbot.sendMessage(userMessage.chat.id, 'Некорректная команда.');
    }
});

slimbot.on('callback_query', async query => {
    if (channelConfig.tags.includes(query.data)) {
      slimbot.sendMessage(query.message.chat.id, 'Ok, ' + query.data);
      const dbURL = process.env.MONGODB_URL_USERS;
      const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
      console.log('User DB connected')
      const User = usersDBConnection.model('user', UserSchema);
      await User.updateOne({chatId: query.message.chat.id}, {$push: {tags: query.data}});
      usersDBConnection.close();
      console.log('User saved')
      return;
    }
    console.log('Tag not exist')
    slimbot.sendMessage(query.message.chat.id, 'What?????');
  });


  slimbot.startPolling();

function getInlineKeyboard(tags) {
    const grid = [];
    for(let i = 0; i < tags.length; i++) {
        if (i % 3 === 0) {
            grid.push([]);
        }

        grid[Math.floor(i / 3)][i % 3] = {text: tags[i], callback_data: tags[i]}
    }
    return grid;
}

function getPostMessage(obj) {
    // ${obj.text.split(' ').slice(0, 25).join(' ')}\n\n
    const viewMessage = `<b>#Сообщение содержит теги ${obj.tags.join(', ')}</b>\n
    <i>Читать далее по сслыке ⬇⬇⬇</i> \n \n <i>Ссылка:</i> ${obj.url}`
    const salaryPart = obj.salary && obj.salary.value ? 
        `\n <i>Зарплата:</i> <b>${obj.salary.value} ${obj.salary.currency}</b>` :
        '';
    return viewMessage + salaryPart;
}