function createBadQueryMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {badQueryText} = vocabulary[language];

        return {text: badQueryText};
    }
}

module.exports = {
    createBadQueryMessageRenderer
};
