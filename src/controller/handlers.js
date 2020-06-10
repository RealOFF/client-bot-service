const channelConfig = require('../../channels-config.json');
const Markup = require('telegraf/markup');
const createMenuKeyboardTemplate = require('../view/templates/menu-keyboard-template');


function createStartHandler({newUserMessage, userExistMessage}, {userModel}) {
    return async function ({from, reply, session}) {
        const newUser = await userModel.save(from);
        let message;
        if (newUser) {
            message = newUserMessage['ru'];
            session.user = newUser;
        } else {
            message = userExistMessage['ru'];
        }
        reply(message);
    }
}

function createHelpHandler({helpMessage}) {
    return function ({reply}) {
        const message = helpMessage['ru'];
        reply(message, {parse_mode: 'html'});
    }
}

function createSettingsHandler({mainWords, selectTagsMessage}, {userModel}, {queries}) {
    return async function ({reply, from, session}) {
        const user = await userModel.getById(from.id, session);
        session.user.newTags = [...session.user.tags];
        const chackedTags = user.tags.map((userTag) => channelConfig.tags.indexOf(userTag));
        const keyboard = getTagsKeyboard(channelConfig.tags, chackedTags);
        const controlButtons = [
            Markup.callbackButton(mainWords['ru'].save, queries.saveTagsQuery),
            Markup.callbackButton(mainWords['ru'].cancel, queries.cancelTagsQuery)
        ];
        keyboard.push(controlButtons);
        reply(selectTagsMessage, Markup.inlineKeyboard(keyboard).extra());
    }
}

function createUpdateHandler({unknownUserMessage, noUpdatesMessage}, {userModel, messageModel}) {
    return async function ({from, reply, session}) {
        const user = await userModel.getById(from.id, session);
    
        if (!user) {
            await reply(unknownUserMessage['ru']);
            return;
        }
    
        console.log('Start fetching messages');
        const postsInfo = await messageModel.getByTags(user.tags);
        const includedTags = [];
    
        for (postInfo of postsInfo) {
            const postMessage = renderPostMessage(postInfo);
            await reply(postMessage, {parse_mode: 'html'});
            includedTags.push(...postInfo.tags)
        };
        const excludedTags = user.tags.filter((tag) => !includedTags.includes(tag.toLowerCase()));
        const uniqExcludedTags = excludedTags.filter((tag, index, self) => self.indexOf(tag) === index);
        if (uniqExcludedTags.length) {
            await reply(`${noUpdatesMessage['ru'][0]} ${uniqExcludedTags.join(', ')} ${noUpdatesMessage['ru'][1]}`);
        }
    }
}

function createMenuHandler({mainWords}) {
    return function ({reply}) {
        reply(
            mainWords.menu,
            createMenuKeyboardTemplate({
                getJobs: mainWords['ru'].getJobs,
                changeTags: mainWords['ru'].changeTags,
                help: mainWords['ru'].help, 
                feedback: mainWords['ru'].feedback
            })()
        )
    }
}

function createCallbackQueryHandler({mainWords}, {userModel}, {queries}) {
    return async function ({reply, update, editMessageText, session, editMessageReplyMarkup}) {
        const {from} = update.callback_query;
        const tag  = update.callback_query.data;
        const {id} = from;
        let user = await userModel.getById(id, session);
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
                Markup.callbackButton(mainWords.save, queries.saveTagsQuery), 
                Markup.callbackButton(mainWords.cancel, queries.cancelTagsQuery)
            ];
            keyboard.push(controlButtons);
            try {
                await editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
            } catch(e) {
                console.error(e);
            }
        } else if (tag === queries.saveTagsQuery) {
            const newTags = session.user.newTags;
            session.user.tags = newTags;
            await userModel.saveTags(id, newTags);
            editMessageText(mainWords.tagsSaved);
        } else if (tag === queries.cancelTagsQuery) {
            session.user.newTags = session.user.tags;
            editMessageText(mainWords.tagsNotSaved);
        } else {
            console.log('Tag not exist');
            await reply(mainWords.badQueryMessage);
        }
    }
}

function createFeedbackHandler({developerChatMessage}) {
    return function ({reply}) {
        reply(developerChatMessage, Markup.inlineKeyboard([Markup.urlButton(feedback, 'https://t.me/jobot_feedback')]).extra());
    }
}

module.exports = {
    createStartHandler,
    createHelpHandler,
    createSettingsHandler,
    createUpdateHandler,
    createMenuHandler,
    createCallbackQueryHandler,
    createFeedbackHandler
};