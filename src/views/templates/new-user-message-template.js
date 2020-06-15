function createNewUserMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {newUserText} = vocabulary[language];

        return newUserText;
    }
}

module.exports = {
    createNewUserMessageRenderer
};
