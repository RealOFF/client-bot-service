const Markup = require('telegraf/markup');

const {renderKeyboard} = require('../library/keyboard');

function createMenuKeyboardRenderer({getJobs, changeTags, help, feedback}) {
    return function() {
        const preapredData = [getJobs, changeTags, help, feedback]
            .map((text) => ({text}));
        return Markup.keyboard(
            renderKeyboard(
                preapredData,
                (el) => el,
                2
            )
        )
        .oneTime()
        .resize()
        .extra();
    }
}

module.exports = {
    createMenuKeyboardRenderer
}
