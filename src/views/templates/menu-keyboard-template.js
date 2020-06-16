const Markup = require('telegraf/markup');

const {renderKeyboard} = require('../library/keyboard');

function createMenuKeyboardRenderer(vocabulary = {}) {
    return function({language = ''}) {
        const {
            menuWord,
            getJobsText,
            changeTagsText,
            helpWord,
            feedbackText
        } = vocabulary[language];

        const preapredData = [getJobsText, changeTagsText, helpWord, feedbackText]
            .map((text) => ({text}));
        const interactive = Markup.keyboard(
            renderKeyboard(
                preapredData,
                (el) => el,
                2
            )
        )
        .oneTime()
        .resize()
        .extra();

        return {text: menuWord, interactive};
    }
}

module.exports = {
    createMenuKeyboardRenderer
}
