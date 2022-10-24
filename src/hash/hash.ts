import { hash, compare, genSalt } from "bcrypt";

export default class Hash {

	/* This is a function that is used to encrypt a password. */
	static async newHash(plainText: string) {
		const saltRounds = Math.floor(Math.random() * (1000 - 101 + 1)) + 101;
		const salt = await genSalt(saltRounds);
		const encryptedText = await hash(plainText, salt);
		return encryptedText;
	}
	
	static async DecryptHash(encryptedText: string, textToCompare: string) {
		const result = await compare(textToCompare, encryptedText);
		return result;
	}

}
