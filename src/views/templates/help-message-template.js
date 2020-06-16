function createHelpMessageRenderer(vocabulary = {}) {
    return function ({language = ''}) {
        const {helpText} = vocabulary[language];

        return {text: helpText};
    }
}

module.exports = {
    createHelpMessageRenderer
};
