function renderKeyboard(getDataCollection, buttonConstructor,elementsPerRow = 3) {
    return getDataCollection.reduce((grid, {text, actionName}, i) => {
        if (i % elementsPerRow === 0) {
            grid.push([]);
        }
        grid[Math.floor(i / elementsPerRow)][i % elementsPerRow] =
            buttonConstructor(text, actionName);
    }, []);
}

module.exports = {renderKeyboard};
