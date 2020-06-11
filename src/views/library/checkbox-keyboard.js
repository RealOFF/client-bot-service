const {renderKeyboard} = require('./keyboard');

function renderCheckboxKeyboard(elements = [], checked = [], buttonConstructor, elementsPerRow = 3) {
    const dataCollection = elements.map(({text, actionName}, i) => ({
            text: text + (checked.includes(i) ? ' ✅' : ''),
            actionName
    }));

    return renderKeyboard(dataCollection, buttonConstructor, elementsPerRow);
}

module.exports = {renderCheckboxKeyboard};
