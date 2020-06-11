const channelConfig = require('../../channels-config.json');

const {createMenuKeyboardRenderer} = require('../views/templates/menu-keyboard-template');
const {createTagsKeyboardRenderer} = require('../views/templates/tags-keyboard-template');
const {createFeedbackLinkRenderer} = require('../views/templates/feedback-link-template');
const {createJobMessageRenderer} = require('../views/templates/job-message-template');


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
        const keyboard = createTagsKeyboardRenderer({
            save: mainWords['ru'].save,
            cancel: mainWords['ru'].cancel
        },
        {queries})(channelConfig.tags, chackedTags);
        reply(selectTagsMessage['ru'], keyboard);
    }
}

function createUpdateHandler({
    unknownUserMessage,
    noUpdatesMessage,
    textBeforeLink,
    period,
    salary
}, {
    userModel,
    messageModel
}) {
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
            const postMessage = createJobMessageRenderer({textBeforeLink, period, salary})(postInfo);
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
            mainWords['ru'].menu,
            createMenuKeyboardRenderer({
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
        user = user ? user : await userModel.save(from);
        if (channelConfig.tags.includes(tag)) {
            const newTags = user.newTags;
            if (user.newTags.includes(tag)) {
                session.user.newTags = newTags.filter((el) => el !== tag);
            } else {
                session.user.newTags.push(tag);
            }
            const chackedTags = session.user.newTags.map((userTag) => channelConfig.tags.indexOf(userTag));
            const keyboard = createTagsKeyboardRenderer({
                save: mainWords['ru'].save,
                cancel: mainWords['ru'].cancel
            },
            {queries})(channelConfig.tags, chackedTags, false);

            try {
                await editMessageReplyMarkup(keyboard);
            } catch(e) {
                console.error(e);
            }
        } else if (tag === queries.saveTagsQuery) {
            const newTags = session.user.newTags;
            session.user.tags = newTags;
            await userModel.saveTags(id, newTags);
            editMessageText(mainWords['ru'].tagsSaved);
        } else if (tag === queries.cancelTagsQuery) {
            session.user.newTags = session.user.tags;
            editMessageText(mainWords['ru'].tagsNotSaved);
        } else {
            console.log('Tag not exist');
            await reply(mainWords['ru'].badQueryMessage);
        }
    }
}

function createFeedbackHandler({developerChatMessage, feedback}) {
    return function ({reply}) {
        reply(developerChatMessage['ru'], createFeedbackLinkRenderer(feedback['ru'])());
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
