const Markup = require('telegraf/markup');

function createFeedbackLinkRenderer(vocabulary = {}, {url = ''}) {
    return function({language = ''}) {
        const {developerChatText, feedbackText} = vocabulary[language];

        const interactive = Markup.inlineKeyboard([
            Markup.urlButton(
                feedbackText,
                url
            )
        ]).extra();
        return {text: developerChatText, interactive}
    }
}

module.exports = {
    createFeedbackLinkRenderer
};
