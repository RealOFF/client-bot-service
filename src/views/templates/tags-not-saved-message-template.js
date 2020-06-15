function createTagsNotSavedMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {tagsNotSavedText} = vocabulary[language];

        return {text: tagsNotSavedText};
    }
}

module.exports = {
    createTagsNotSavedMessageRenderer
};
