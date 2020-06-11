const Markup = require('telegraf/markup');

function createFeedbackLinkRenderer({feedback}) {
    return function() {
        return Markup.inlineKeyboard([
            Markup.urlButton(
                feedback,
                'https://t.me/jobot_feedback'
            )
        ]).extra();
    }
}

module.exports = {
    createFeedbackLinkRenderer
};
