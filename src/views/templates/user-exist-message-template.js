function createUserExistMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {unknownUserText} = vocabulary[language];

        return {text: unknownUserText};
    }
}

module.exports = {
    createUserExistMessageRenderer
};
