import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { Account, EmailVerification, PhoneVerification, VerificationStatus } from './auth.model';
import { v4 } from "uuid";
import { Authority } from "./auth.model";
import { InjectModel } from "@nestjs/mongoose";
import { sign, verify } from "jsonwebtoken";
import { randomBytes } from "crypto";

/**
 * Class with static methods for validating different credentials
 */
export class ValidatorClass {
	/**
	 * validates a given email and returns a boolean as a value
	 * true if the provided parameter is an email, 
	 * false if the provided parameter is not an email
	 * @param { string } email 
	 */
	static validateEmail(email: string): boolean {
		const emailRgExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
		return emailRgExp.test(email);
	}
	/**
	 * validates a given password and returns a boolean as a value
	 * ##### true if the password is 8 character long and contains atleast one special character, a number, a uppercase and a lower case letter
	 * ##### false if doesnot contains even one of the above conditions.
	 * @param { string } password 
	 */
	static validatePassword(password: string): boolean {
		const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
		return strongPassword.test(password);
	}
	/**
	 * returns true if the given parameter is a phone &
	 * returns false if not
	 * @param { string } phone
	 * @returns { boolean }
	 */
	static validatePhone(phone: string | number): boolean {
		const phoneRegex = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
		return phoneRegex.test(phone.toString());
	}
}

/**
 * Static class for generating, decoding, and updating the tokens and its instances
 */
export class TokenizationClass {
	/**
	 * @param data object containing the collection id in the database
	 * @returns a jwt generated string which is in the form `{secretKey}_!{generatedToken}`
	 */
	public static GenerateTokenForLogin(data: { id: string }) {
		const newSecret = randomBytes(64).toString('hex');
		const returnValue = sign({ data: data }, newSecret, { expiresIn: '7d' });
		return (newSecret + '_!' + returnValue);
	}

	/**
	 * @param token token stored in the local machine on the client side.
	 * it updates the expiry date on the existing token.
	 */
	public static UpdateTokenForLogin(token: string) {
		try {
			const tokenData = this.DecodeTokenForLogin(token);
			return this.GenerateTokenForLogin(tokenData);
		}
		catch(err) {
			return ({
				status: 'error',
				...err
			});
		}
	}

	/**
	 * @param token string form`{secretKey}_!{generatedToken}`
	 * @returns an object containing the collection id of the account in the DB
	 */
	public static DecodeTokenForLogin(token: string) {
		const splitToken = token.split('_!');
		return verify(splitToken[1], splitToken[0]) as { id: string };
	}
}

@Injectable({
	scope: Scope.TRANSIENT
})
export class VerificationClass {
	constructor(
		@InjectModel('EmailVerification') private readonly verifyEmail: Model<EmailVerification>,
		@InjectModel('PhoneVerification') private readonly verifyPhone: Model<PhoneVerification>
	) {}
	
	public async checkEmailVerificationAvailability(data: { emailId: string }) {
		const result = await this.verifyEmail.findOne({ emailId: data.emailId });
		if (!result) {
			return ({
				statusCode: 404,
				statusMessage: 'Verification Not Available'
			});
		}
		return ({
			statusCode: 201,
			statusMessage: 'Verification Available',
			id: result.id as string,
			verificationStatus: result.verificationStatus
		});
	}

	public async checkPhoneVerificationAvailability(data: { phone: string | number }) {
		const result = await this.verifyPhone.findOne({ phone: data.phone.toString() });
		if (!result) {
			return ({
				statusCode: 404,
				statusMessage: 'Verification Not Available'
			});
		}
		return ({
			statusCode: 201,
			statusMessage: 'Verification Available',
			id: result.id as string,
			verificationStatus: result.verificationStatus
		});
	}

	public async generateEmailVerificationToken(data: { emailId: string, refId: string }) {
		const availablity = await this.checkEmailVerificationAvailability({ emailId: data.emailId });
		if (availablity.statusCode === 404) {
			const newVerification = new this.verifyEmail({
				emailId: data.emailId,
				verificationToken: randomBytes(32).toString('hex'),
				expiryDate: (Date.now() + (12 * 60 * 60)),
				refId: data.refId,
				verificationStatus: VerificationStatus.NOTVERIFIED
			});
			const res = await newVerification.save();
			return ({
				verificationToken: res.verificationToken as string
			});
		}
		else {
			return ({
				statusCode: 201
			});
		}
	}

	public async generatePhoneVerificationOTP(data: { phone: string | number, refId: string }) {
		const availablity = await this.checkPhoneVerificationAvailability({ phone: data.phone.toString() });
		if (availablity.statusCode === 404) {
			const newVerification = new this.verifyPhone({
				phone: data.phone.toString(),
				OTP: Math.floor(100000 + Math.random() * 900000),
				expiryDate: (Date.now() + (12 * 60 * 60)),
				refId: data.refId,
				verificationStatus: VerificationStatus.NOTVERIFIED
			});

			const res = await newVerification.save();
			return ({
				OTP: res.OTP as number
			});
		}
		else {
			return ({
				statusCode: 201
			});
		}
	}

	public async RequestForAnotherEmailVerification(data: { emailId: string }) {
		const availability = await this.checkEmailVerificationAvailability(data);
		
		if (availability.statusCode === 201) {
			if (availability.verificationStatus === VerificationStatus.VERIFIED) {
				return ({
					statusCode: 400,
					statusMessage: 'Email already Verified'
				});
			}
			else {
				const update = await this.verifyEmail.findByIdAndUpdate(availability.id, { 
					verificationToken: randomBytes(32).toString('hex'),
					expiryDate: (Date.now() + (12 * 60 * 60)),
				}, { returnOriginal: false });
				return { statusCode: 200, verificationToken: update.verificationToken };
			}
		}

		else if (availability.statusCode === 404) {
			return ({
				statusCode: 404,
				statusMessage: 'Email Not Found'
			});
		}
	}

	public async RequestForAnotherMobileVerification(data: { phone: string | number }) {
		const availability = await this.checkPhoneVerificationAvailability(data);
		
		if (availability.statusCode === 201) {
			if (availability.verificationStatus === VerificationStatus.VERIFIED) {
				return ({
					statusCode: 400,
					statusMessage: 'Phone already Verified'
				});
			}
			else {
				const update = await this.verifyPhone.findByIdAndUpdate(availability.id, { 
					OTP: Math.floor(100000 + Math.random() * 900000),
					expiryDate: (Date.now() + (12 * 60 * 60)),
				}, { returnOriginal: false });
				return { statusCode: 200, OTP: update.OTP };
			}
		}

		else if (availability.statusCode === 404) {
			return ({
				statusCode: 404,
				statusMessage: 'Email Not Found'
			});
		}
	}
}

/**
 * Instance used for exposing the database and handling data
 */
@Injectable({
	scope: Scope.TRANSIENT
})
export class AuthenticationClass {
	constructor(
		@InjectModel('Accounts') private readonly account: Model<Account>,
		private readonly verification: VerificationClass
	) {}

	//================ Api for Checking for account availability
	private async checkForAccountAvailability(params: { emailId: string } | {  phone: string | number } | { emailId: string, phone: string | number }) {

		if ('emailId' in params) {
			const result = await this.account.findOne({ emailId: params.emailId }).exec();
			if (result) {
				console.log('emailId present:', result);
				return {
					statusCode: 200,
					available: 'emailId',
					id: result.id as string
				};
			}
		}

		if ('phone' in params) {
			const result = await this.account.findOne({ phone: params.phone.toString() }).exec();
			if (result) {
				console.log('Phone present:', result);
				return {
					statusCode: 200,
					available: 'phone',
					id: result.id as string
				}
			}
		}

		return {
			statusCode: 1,
			available: 'none'
		}
	}
	public async checkForAccountAvailabilityGateWay(params: { emailId: string} | { phone: string | number } | { emailId: string, phone: string | number }) {
		if ('emailId' in params && !(ValidatorClass.validateEmail(params.emailId))) {
			return ({
				statusCode: 400,
				statusMessage: 'invalid Email Id',
			});
		}
		if ('phone' in params && !(ValidatorClass.validatePhone(params.phone))) {
			return ({
				statusCode: 400,
				statusMessage: 'Invalid Phone Number'
			});
		}

		return await this.checkForAccountAvailability(params);
	}

	//================ Api for creating a new Account
	private async createAccount(params: {
		firstName: string,
		lastName: string,
		emailId: string,
		password: string,
		phone: string | number
	}) {

		const newAccount = new this.account({
			UiD: v4(),
			firstName: params.firstName,
			lastName: params.lastName,
			emailId: params.emailId,
			password: params.password,
			phone: params.phone.toString(),
			createAt: Date(),
			Authority: Authority.CLIENT,
			verificationStatus: {
				email: VerificationStatus.NOTVERIFIED,
				phone: VerificationStatus.NOTVERIFIED
			}
		});

		try {
			const result = await newAccount.save();
			const OTP = await this.verification.generatePhoneVerificationOTP({ phone: result.phone, refId: result.id });
			const emailVerificationToken = await this.verification.generateEmailVerificationToken({ emailId: result.emailId, refId: result.id });
			return ({
				statusCode: 200,
				statusMessage: 'Account Created',
				AccountId: result.UiD as string,
				verfication: {
					emailVerificationToken: emailVerificationToken.verificationToken,
					OTP: OTP.OTP,
				}
			});
		} catch (e) {
			return ({
				statusCode: 400,
				statusMessage: 'Unable to create account'
			});
		}
	}
	public async createAccountGateway(params: {
		firstName: string,
		lastName: string,
		emailId: string,
		password: string,
		phone: string | number
	}) {
		return await this.createAccount(params);
	}

	//================ Api for logging in with an existing account
	private async Login(credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}) {
		const result = await this.account.findOne({ ...credentials }).exec();

		if (!result) 
			return ({
				statusCode: 404, 
				statusMessage: 'Account Not Found'
			});

		else {
			if (result.verificationStatus.email === VerificationStatus.NOTVERIFIED && result.verificationStatus.phone === VerificationStatus.NOTVERIFIED) {
				return ({
					status: 400,
					statusMessage: 'Email and Phone are not verified'
				});
			}
			else if (result.verificationStatus.email === VerificationStatus.NOTVERIFIED) 
				return ({
					status: 400,
					statusMessage: 'Email is not verified'
				});
			else if (result.verificationStatus.phone === VerificationStatus.NOTVERIFIED)
				return ({
					status: 400,
					statusMessage: 'Phone number is not verified'
				});

			return ({
				statusCode: 200,
				statusMessage: 'Logged In',
				authToken: TokenizationClass.GenerateTokenForLogin({ id: (result.id as string) })
			});
		}
	}
	public async LoginGateway(credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}) {
		if ('emailId' in credentials && 'password' in credentials) {
			if (!(ValidatorClass.validateEmail(credentials.emailId)) && !(ValidatorClass.validatePassword(credentials.password))) {
				return ({
					statusCode: 400,
					statusMessage: 'Provided Credentials are invalid'
				});
			}
			else {
				return await this.Login(credentials);
			}
		}

		else if ('phone' in credentials && 'password' in credentials) {
			if (!(ValidatorClass.validatePhone(credentials.phone)) && !(ValidatorClass.validatePassword(credentials.password))) {
				return ({
					statusCode: 400,
					statusMessage: 'Provided Credentials are invalid'
				});
			}
			else {
				return await this.Login(credentials);
			}
		}
	}

	//================ Api for requesting another email Token
	private async requestEmailVerificationToken(credentials: { emailId: string }) {
		const account = await this.account.findOne({ emailId: credentials.emailId }).exec();
		if (!account) {
			return ({
				statusCode: 404,
				statusMessage: 'Account for given Email not found'
			});
		}
		else if (account.verificationStatus.email === (VerificationStatus.VERIFIED as number)) {
			return ({
				statusCode: 400,
				statusMessage: 'Email already verified'
			});
		}
		else if (account.verificationStatus.email === VerificationStatus.NOTVERIFIED as number) {
			const newToken = await this.verification.RequestForAnotherEmailVerification({ emailId: credentials.emailId });

			if (newToken.statusCode === 200) {
				return ({
					status: 'New Token generated',
					verificationToken: newToken.verificationToken
				});
			}

			else if (newToken.statusCode === 400 || newToken.statusCode === 404) {
				return newToken;
			}

		}
	}
	public async requestEmailVerificationTokenGateway(credentials: { emailId: string }) {
		if (ValidatorClass.validateEmail(credentials.emailId)) {
			return await this.requestEmailVerificationToken(credentials);
		}
		else {
			return {
				statusCode: 400,
				statusMessage: 'Provided email is invalid'
			}
		}
	}

	//================ Api for requesting another OTP
	private async requestOTP(credentials: { phone: string | number }) {
		const account = await this.account.findOne({ phone: credentials.phone.toString() }).exec();
		if (!account) {
			return ({
				statusCode: 404,
				statusMessage: 'Account for given Phone Number not found'
			});
		}
		else if (account.verificationStatus.phone === (VerificationStatus.VERIFIED as number)) {
			return ({
				statusCode: 400,
				statusMessage: 'Phone already verified'
			});
		}
		else if (account.verificationStatus.phone === VerificationStatus.NOTVERIFIED as number) {
			const newToken = await this.verification.RequestForAnotherMobileVerification({ phone: credentials.phone });

			if (newToken.statusCode === 200) {
				return ({
					status: 'New OTP generated',
					OTP: newToken.OTP
				});
			}

			else if (newToken.statusCode === 400 || newToken.statusCode === 404) {
				return newToken;
			}

		}
	}
	public async requestOTPGateway(credentials: { phone: string | number }) {
		if (ValidatorClass.validatePhone(credentials.phone)) {
			return await this.requestOTP(credentials);
		}
		else {
			return {
				statusCode: 400,
				statusMessage: 'Provided Phone Number is invalid'
			}
		}
	}
}

@Injectable()
export class AuthService {
	constructor(private readonly authenticate: AuthenticationClass) {}

	public async createAccount(params: {
		firstName: string,
		lastName: string,
		emailId: string,
		phone: string | number,
		password: string
	}) {
		if (
			'firstName' in params &&
			'lastName' in params &&
			'emailId' in params && ValidatorClass.validateEmail(params.emailId) &&
			'phone' in params && ValidatorClass.validatePhone(params.phone) &&
			'password' in params && ValidatorClass.validatePassword(params.password)
		) {
			const response = await this.authenticate.checkForAccountAvailabilityGateWay({ emailId: params.emailId, phone: params.phone });

			if (response.statusCode === 1) {
				return await this.authenticate.createAccountGateway(params);
			}
			else {
				return response;
			}
		}
		else 
			return ({
				statusCode: 400,
				statusMessage: 'Provided credentials are missing or incorrect'
			});

	}

	public async login(credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}) {
		return await this.authenticate.LoginGateway(credentials);
	}

	public async requestForNewEmailToken(credentials: { emailId: string }) {
		return await this.authenticate.requestEmailVerificationTokenGateway(credentials);
	}
	public async requestForNewOTP(credentials: { phone: string | number }) {
		return await this.authenticate.requestOTPGateway(credentials);
	}
}
