function createJobMessageRenderer(vocabulary = {}) {
    return function (obj = {}, {language = ''}) {
        const {
            linkText,
            salaryWord,
            hourWord,
            dayWord,
            weekWord
        } = vocabulary[language];

        const viewMessage =
            `<b>#${obj.tags.join('  #')}</b>\n<i>${linkText} ⬇⬇⬇</i>\n\n${obj.url}\n`;
        let salaryPart = '';
    
        if (obj.salary && obj.salary.value) {
                let period;

                switch(obj.salary.period) {
                    case 'HOUR':
                        period = '/ ' + hourWord;
                        break;
                    case 'DAY':
                        period = '/ ' + dayWord;
                        break;
                    case 'WEEK':
                        period = '/ ' + weekWord;
                        break;
                    default:
                        period = '';
                }
                const currency = obj.salary.currency || '';
                salaryPart = `\n <i>${salaryWord}🤑:</i> <b>${obj.salary.value} ${currency} ${period}</b>`;
        }
        return {text: viewMessage + salaryPart};
    }
}

module.exports = {
    createJobMessageRenderer
};
