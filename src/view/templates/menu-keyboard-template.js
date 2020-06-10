const Markup = require('telegraf/markup');

const {renderKeyboard} = require('../library/keyboard');

function createMenuKeyboardRenderer({getJobs, changeTags, help, feedback}) {
    return function() {
        return renderKeyboard(
            [getJobs, changeTags, help, feedback],
            Markup.keyboard,
            2
        )
        .oneTime()
        .resize()
        .extra();
    }
}

module.exports = {
    createMenuKeyboardRenderer
}
