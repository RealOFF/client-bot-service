function createNoUpdatesMessageRenderer(vocabulary = {}) {
    return function (tags, {language = ''}) {
        const {noUpdatesText} = vocabulary[language];

        const text = `${noUpdatesText[0]} ${tags.join(', ')} ${noUpdatesText[1]}`;
        return {text};
    }
}

module.exports = {
    createNoUpdatesMessageRenderer
};
