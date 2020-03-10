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
    console.log(userMessage)
    if (userMessage.text === '/start') {
        const dbURL = process.env.MONGODB_URL_USERS;
        const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
        console.log('User DB connected')
        const User = usersDBConnection.model('user', UserSchema);
        const user = User();
        user.chatId = userMessage.chat.id;
        await user.save();
        return; //todo check user is exist?
    }
    if (userMessage.text === '/update') {
        const dbURL = process.env.MONGODB_URL_USERS;
        const usersDBConnection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
        const User = usersDBConnection.model('user', UserSchema);
        const user = await User.findOne({chatId: userMessage.chat.id});
        usersDBConnection.close();
        console.log('Start fetch messages');
        const messages = await getMessages(user.tags);
        messages.forEach((obj) => {
            slimbot.sendMessage(userMessage.chat.id, getPostMessage(obj), {parse_mode: 'html'});
        });
        return;
    }
    if (userMessage.text === '/settings') {
        const optionalParams = {
            parse_mode: 'html',
            reply_markup: JSON.stringify({
            inline_keyboard: getInlineKeyboard(channelConfig.tags)
            })
        };
        slimbot.sendMessage(userMessage.chat.id, 'Параметры', optionalParams);
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
    const viewMessage = `${obj.text.split(' ').slice(0, 25).join(' ')}\n\n
    <i>Читать далее по сслыке ⬇⬇⬇</i> \n \n <i>Ссылка:</i> ${obj.url}`
    const salaryPart = obj.salary && obj.salary.value ? 
        `\n <i>Зарплата:</i> <b>${obj.salary.value} ${obj.salary.currency}</b>` :
        '';
    return viewMessage + salaryPart;
}