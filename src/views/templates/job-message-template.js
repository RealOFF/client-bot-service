function createJobMessageRenderer({textBeforeLink, period, salary}) {
    const periodWord = period;
    const salaryWord = salary;
    return function (obj = {}) {
        const viewMessage = `<b>#${obj.tags.join('  #')}</b>\n<i>${textBeforeLink} ⬇⬇⬇</i>\n\n${obj.url}\n`;
        let salaryPart = '';
    
        if (obj.salary?.value) {
                let period;

                switch(obj.salary.period) {
                    case 'HOUR':
                        period = '/ ' + periodWord.hour;
                        break;
                    case 'DAY':
                        period = '/ ' + periodWord.day;
                        break;
                    case 'WEEK':
                        period = '/ ' + periodWord.week;
                        break;
                    default:
                        period = '';
                }
                const currency = obj.salary.currency || '';
                salaryPart = `\n <i>${salaryWord}🤑:</i> <b>${obj.salary.value} ${currency} ${period}</b>`;
        }
        return viewMessage + salaryPart;
    }
}

module.exports = {
    createJobMessageRenderer
};
