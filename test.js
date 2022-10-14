const daysInMonth = (m, y) => m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);

const validateDOB = ({ date, month, year }) => {
	const today = new Date();
	if (date < 1 || date > 31 || month < 1 || month > 12 || year < 1950) return 'all';
	else if (year > today.getFullYear()) return 'year';
	else if (year === today.getFullYear() && (month >= (today.getMonth() + 1))) return 'month';
	else if (year === today.getFullYear() && (month === (today.getMonth() + 1)) && (date >= today.getDate())) 'date';
	else if (date > daysInMonth(month, year)) 'all';
	return 'none';
}

console.log('10-11-2022', validateDOB({ date: 10, month: 11, year: 2022 }));
console.log('30-03-2001', validateDOB({ date: 30, month: 3, year: 2001 }));
console.log('20-11-2003', validateDOB({ date: 20, month: 11, year: 2003 }));
console.log('54-02-2001', validateDOB({ date: 54, month: 2, year: 2001 }));
console.log('10-21-2022', validateDOB({ date: 10, month: 21, year: 2022 }));