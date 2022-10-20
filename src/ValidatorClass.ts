/**
 * Class with static methods for validating different credentials
 */
export class ValidatorClass {
	/**
	 * It checks if the email is valid by checking if it contains an @ symbol and a . symbol
	 * @param {string} email - string - The email address to validate
	 * @returns A boolean value.
	 */
	static validateEmail(email: string): boolean {
		const emailRgExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
		return emailRgExp.test(email);
	}
	/**
	 * The password must be at least 8 characters long and contain at least one lowercase letter, one
	 * uppercase letter, one number, and one special character.
	 * @param {string} password - The password to validate.
	 * @returns A boolean value.
	 */
	static validatePassword(password: string): boolean {
		const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
		return strongPassword.test(password);
	}
	/**
	 * The function takes a phone number as a string or number and returns true if the phone number is
	 * valid and false if it is not.
	 * @param {string | number} phone - string | number
	 * @returns A boolean value.
	 */
	static validatePhone(phone: string | number): boolean {
		const phoneRegex = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
		return phoneRegex.test(phone.toString());
	}
	/**
	 * It checks if the country code is a valid country code.
	 * @param {string} countryCode - The country code of the phone number.
	 * @returns A boolean value.
	 */
	static validateCountryCode(countryCode: string): boolean {
		const countryCodeRegex = new RegExp(/^(\+?\d{1,3}|\d{1,4})$/);
		return countryCodeRegex.test(countryCode);
	}
	/**
	 * returns 0 if the given parameter is a valid country code &
	 * returns number if not
	 * @param {{ date: number, month: number, year: number}} dob
	 * @returns { DOB }
	 */
	static validateDOB(dob: { date: number, month: number, year: number }): DOB {
		const today = new Date();
		if (dob.date < 1 || dob.date > 31 || dob.month < 1 || dob.month > 12 || dob.year < 1950) return DOB.ALL;
		else if (dob.year > today.getFullYear()) return DOB.YEAR;
		else if (dob.year === today.getFullYear() && (dob.month >= (today.getMonth() + 1))) return DOB.MONTH;
		else if (dob.year === today.getFullYear() && (dob.month === (today.getMonth() + 1)) && (dob.date >= today.getDate())) return DOB.DATE;
		else if (dob.date > daysInMonth(dob.month, dob.year)) return DOB.ALL;
		return DOB.NONE;
	}
}

const daysInMonth = (m: number, y: number) => m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);

export enum DOB {
	DATE = 0x00c,
	MONTH = 0x0c0,
	YEAR = 0xc00,
	NONE = 0,
	ALL = 1,
}