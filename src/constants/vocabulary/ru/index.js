const texts = require('./texts.json');
const words = require('./words.json');

module.exports = {
    ...texts,
    ...words
};
