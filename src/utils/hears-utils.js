function getHears(packages = {}, hearName = '') {
    return Object.values(packages).map((el) => el[hearName]);
}

module.exports = {
    getHears
};
