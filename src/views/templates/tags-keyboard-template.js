const Markup = require('telegraf/markup');

const {renderCheckboxKeyboard} = require('../library/checkbox-keyboard');

function createTagsKeyboardRenderer({save, cancel}, {queries}) {
    return function(tags, chackedTags, isNew = true) {
        const keyboard = renderCheckboxKeyboard(
            tags.map((text) => ({text, actionName: text})),
            chackedTags,
            Markup.callbackButton
        );

        const controlButtons = [
            Markup.callbackButton(save, queries.saveTagsQuery),
            Markup.callbackButton(cancel, queries.cancelTagsQuery)
        ];
        keyboard.push(controlButtons);
        const inlineKeyboard = Markup.inlineKeyboard(keyboard);
        return isNew ? inlineKeyboard.extra() : inlineKeyboard;
    }
}

module.exports = {
    createTagsKeyboardRenderer
}
