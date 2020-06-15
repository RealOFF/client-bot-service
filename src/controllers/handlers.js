const channelConfig = require('../constants/channels-config.json');

function createStartHandler({
    renderNewUserMessage,
    renderUserExistMessage
},
{userModel}) {
    return async function ({from, reply, session}) {
        const newUser = await userModel.save(from);
        let text;
        if (newUser) {
            const template = renderNewUserMessage({language: 'ru'});
            text = template.text;
            session.user = newUser;
        } else {
            const template = renderUserExistMessage({language: 'ru'});
            text = template.text;
        }
        reply(text);
    }
}

function createHelpHandler({renderHelpMessage}) {
    return function ({reply}) {
        const {text} = renderHelpMessage({language: 'ru'});
        reply(text, {parse_mode: 'html'});
    }
}

function createSettingsHandler({renderTagsKeyboard}, {userModel}, {queries}) {
    return async function ({reply, from, session}) {
        const user = await userModel.getById(from.id, session);
        session.user.newTags = [...session.user.tags];
        const chackedTags = user.tags.map((userTag) => channelConfig.tags.indexOf(userTag));
        const {text, interactive} = renderTagsKeyboard(
            channelConfig.tags,
            chackedTags,
            {
                queries,
                language: 'ru'
            }
        );
        reply(text, interactive);
    }
}

function createUpdateHandler({
    renderUnknownUserMessage,
    renderJobMessage,
    renderNoUpdatesMessage
}, {
    userModel,
    messageModel
}) {
    return async function ({from, reply, session}) {
        const user = await userModel.getById(from.id, session);
    
        if (!user) {
            const {text} = renderUnknownUserMessage({language: 'ru'});
            await reply(text);
            return;
        }
    
        console.log('Start fetching messages');
        const postsInfo = await messageModel.getByTags(user.tags);
        const includedTags = [];
    
        for (postInfo of postsInfo) {
            const {text} = renderJobMessage(postInfo, {language: 'ru'});
            await reply(text, {parse_mode: 'html'});
            includedTags.push(...postInfo.tags)
        };
        const excludedTags = user.tags.filter((tag) => !includedTags.includes(tag.toLowerCase()));
        const uniqExcludedTags = excludedTags.filter((tag, index, self) => self.indexOf(tag) === index);
        if (uniqExcludedTags.length) {
            const {text} = renderNoUpdatesMessage(uniqExcludedTags, {language: 'ru'}); 
            await reply(text);
        }
    }
}

function createMenuHandler({renderMenuKeyboard}) {
    return function ({reply}) {
        const {text, interactive} = renderMenuKeyboard({language: 'ru'});
        reply(text, interactive);
    }
}

function createCallbackQueryHandler({
    renderTagsKeyboard,
    renderTagsSavedMessage,
    renderTagsNotSavedMessage,
    renderBadQueryMessage
},
{userModel},
{queries}) {
    return async function ({
        reply,
        update,
        editMessageText,
        editMessageReplyMarkup,
        session
    }) {
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
            const chackedTags = session.user.newTags
                    .map((userTag) => channelConfig.tags.indexOf(userTag));
            const {interactive} = renderTagsKeyboard(
                channelConfig.tags,
                chackedTags,
                {
                    language: 'ru',
                    isNew: false,
                    queries
                }
            );

            try {
                await editMessageReplyMarkup(interactive);
            } catch(e) {
                console.error(e);
            }
        } else if (tag === queries.saveTagsQuery) {
            const newTags = session.user.newTags;
            session.user.tags = newTags;
            await userModel.saveTags(id, newTags);
            const {text} = renderTagsSavedMessage({language: 'ru'});
            editMessageText(text);
        } else if (tag === queries.cancelTagsQuery) {
            session.user.newTags = session.user.tags;
            const {text} = renderTagsNotSavedMessage({language: 'ru'});
            editMessageText(text);
        } else {
            console.log('Tag not exist');
            const {text} = renderBadQueryMessage({language: 'ru'});
            await reply(text);
        }
    }
}

function createFeedbackHandler({renderFeedbackLink}) {
    return async function ({reply}) {
        const {text, interactive} = renderFeedbackLink({language: 'ru'});
        reply(text, interactive);
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
