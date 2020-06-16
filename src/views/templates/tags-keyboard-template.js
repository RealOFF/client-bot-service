const Markup = require('telegraf/markup');

const {renderCheckboxKeyboard} = require('../library/checkbox-keyboard');

function createTagsKeyboardRenderer(vocabulary = {}) {
    return function(
        tags = [],
        chackedTags = [],
        {
            isNew = true,
            language = '',
            queries = {}
        }
    ) {
        const {saveWord, cancelWord, selectTagsText} = vocabulary[language];

        const keyboard = renderCheckboxKeyboard(
            tags.map((text) => ({text, actionName: text})),
            chackedTags,
            Markup.callbackButton
        );

        const controlButtons = [
            Markup.callbackButton(saveWord, queries.saveTagsQuery),
            Markup.callbackButton(cancelWord, queries.cancelTagsQuery)
        ];
        keyboard.push(controlButtons);
        const inlineKeyboard = Markup.inlineKeyboard(keyboard);
        return {
            text: selectTagsText,
            interactive: isNew ? inlineKeyboard.extra() : inlineKeyboard
        };
    }
}

module.exports = {
    createTagsKeyboardRenderer
}
