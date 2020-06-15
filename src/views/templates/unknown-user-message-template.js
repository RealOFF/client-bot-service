function createUnknownUserMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {selectTagsText} = vocabulary[language];

        return selectTagsText;
    }
}

module.exports = {
    createUnknownUserMessageRenderer
};
