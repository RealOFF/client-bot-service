function renderKeyboard(elements, buttonConstructor, elementsPerRow = 3) {
    return elements.reduce((grid, {text, actionName}, i) => {
        if (i % elementsPerRow === 0) {
            grid.push([]);
        }
        grid[Math.floor(i / elementsPerRow)][i % elementsPerRow] =
            buttonConstructor(text, actionName);
        return grid;
    }, []);
}

module.exports = {renderKeyboard};
