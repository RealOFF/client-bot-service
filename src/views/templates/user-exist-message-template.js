function createUserExistMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {userExistText} = vocabulary[language];

        return {text: userExistText};
    }
}

module.exports = {
    createUserExistMessageRenderer
};
