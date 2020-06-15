function createNewUserMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {newUserText} = vocabulary[language];

        return {text: newUserText};
    }
}

module.exports = {
    createNewUserMessageRenderer
};
