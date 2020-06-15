function createUnknownUserMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {selectTagsText} = vocabulary[language];

        return {text: selectTagsText};
    }
}

module.exports = {
    createUnknownUserMessageRenderer
};
