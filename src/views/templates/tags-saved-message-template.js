function createTagsSavedMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {tagsSavedText} = vocabulary[language];

        return {text: tagsSavedText};
    }
}

module.exports = {
    createTagsSavedMessageRenderer
};
