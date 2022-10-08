import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { Account, ResetStatus, EmailVerification, LoginLogs, PhoneVerification, Requests, VerificationStatus, RequestTypes } from './auth.model';
import { v4 } from "uuid";
import { Authority } from "./auth.model";
import { InjectModel } from "@nestjs/mongoose";
import { sign, verify, VerifyErrors  } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { config } from 'dotenv';
config();

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
	public static GenerateToken(data: { id: string }) {
		const newSecret = randomBytes(64).toString('hex');
		const returnValue = sign({ data: data }, newSecret, { expiresIn: '7d' });
		return (newSecret + '_!' + returnValue);
	}

	/**
	 * @param token token stored in the local machine on the client side.
	 * it updates the expiry date on the existing token.
	 */
	public static UpdateToken(token: string) {
		try {
			const tokenData = this.DecodeToken(token);
			return this.GenerateToken({id: tokenData.data.id });
		}
		catch(err) {
			return ({
				statusCode: 'error',
				...err
			});
		}
	}

	/**
	 * @param token string form`{secretKey}_!{generatedToken}`
	 * @returns an object containing the collection id of the account in the DB
	 */
	public static DecodeToken(token: string) {
		try {
			const splitToken = token.split('_!');
			return verify(splitToken[1], splitToken[0]) as { data: { id: string } };
		}
		catch (e: unknown) {
			throw e;
		}
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
				expiryDate: (Date.now() + (12 * 60 * 60 * 60)),
				refId: data.refId,
				verificationStatus: VerificationStatus.NOTVERIFIED,
				verifiedOn: 'null'
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
				expiryDate: (Date.now() + (12 * 60 * 60 * 60)),
				refId: data.refId,
				verificationStatus: VerificationStatus.NOTVERIFIED,
				verifiedOn: 'null'
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
					expiryDate: (Date.now() + (12 * 60 * 60 * 60)),
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
					expiryDate: (Date.now() + (12 * 60 * 60 * 60)),
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

	public async VerifyEmail(data: { refId: string, verificationToken: string }) {
		const getObject = await this.verifyEmail.findOne({ refId: data.refId });
		if (!getObject) {
			return ({
				statusCode: 404,
				statusMessage: 'Email Not Found'
			});
		}
		else if (getObject.verificationStatus === VerificationStatus.VERIFIED) {
			return ({
				statusCode: 400,
				statusMessage: 'Email already verified'
			});
		}
		else if (getObject.expiryDate <= Date.now()) {
			return ({
				statusCode: 400,
				statusMessage: 'Token expired, please request for another verification token'
			});
		}
		
		if (getObject.verificationToken === data.verificationToken) {
			const updateStatus = await this.verifyEmail.findByIdAndUpdate(getObject.id, { verificationStatus: VerificationStatus.VERIFIED, verifiedOn: Date() }, { returnOriginal: false });
			if (updateStatus) {
				return ({
					statusCode: 201,
					statusMessage: 'Email Verified'
				});
			}
			else return ({
				statusCode: 404, 
				statusMessage: 'Unable to verify EmailId'
			});
		}
		else {
			return ({
				statusCode: 400,
				statusMessage: 'Wrong Token'
			});
		}
	}
	public async VerifyOTP(data: { refId: string, OTP: number }) {
		const getObject = await this.verifyPhone.findOne({ refId: data.refId });
		if (!getObject) {
			return ({
				statusCode: 404,
				statusMessage: 'Phone Number Not Found'
			});
		}
		else if (getObject.verificationStatus === VerificationStatus.VERIFIED) {
			return ({
				statusCode: 400,
				statusMessage: 'Phone Number already verified'
			});
		}
		else if (getObject.expiryDate <= Date.now()) {
			return ({
				statusCode: 400,
				statusMessage: 'OTP expired, please request for another verification token'
			});
		}
		
		if (getObject.OTP === data.OTP) {
			const updateStatus = await this.verifyPhone.findByIdAndUpdate(getObject.id, { verificationStatus: VerificationStatus.VERIFIED, verifiedOn: Date() }, { returnOriginal: false });
			if (updateStatus) {
				return ({
					statusCode: 201,
					statusMessage: 'Phone Number Verified'
				});
			}
			else return ({
				statusCode: 404, 
				statusMessage: 'Unable to verify Phone Number'
			});
		}
		else {
			return ({
				statusCode: 400,
				statusMessage: 'Wrong OTP'
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
		@InjectModel('LoginLogs') private readonly loginLogs: Model<LoginLogs>,
		@InjectModel('Requests') private readonly requests: Model<Requests>,
		private readonly verification: VerificationClass
	) {}

	//================ Api for Checking for account availability
	private async checkForAccountAvailability(params: { emailId: string } | {  phone: string | number } | { emailId: string, phone: string | number }) {

		if ('emailId' in params) {
			const result = await this.account.findOne({ emailId: params.emailId }).exec();
			if (result) {
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
			createdAt: Date(),
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
					emailVerificationurl: `${process.env.URL}:${process.env.PORT}/user/verify-email?email=${ result.emailId }&token=${ emailVerificationToken.verificationToken }`,
					OTP: OTP.OTP,
				}
			});
		} catch (e) {
			return ({
				statusCode: 400,
				statusMessage: 'Unable to create account',
				error: e,
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
	}, headers: Headers, ip: string) {
		const result = await this.account.findOne({ ...credentials }).exec();

		if (!result) 
			return ({
				statusCode: 404, 
				statusMessage: 'Account Not Found'
			});

		else {
			if (result.verificationStatus.email === VerificationStatus.NOTVERIFIED && result.verificationStatus.phone === VerificationStatus.NOTVERIFIED) {
				return ({
					statusCode: 400,
					statusMessage: 'Email and Phone are not verified'
				});
			}
			else if (result.verificationStatus.email === VerificationStatus.NOTVERIFIED) 
				return ({
					statusCode: 400,
					statusMessage: 'Email is not verified'
				});
			else if (result.verificationStatus.phone === VerificationStatus.NOTVERIFIED)
				return ({
					statusCode: 400,
					statusMessage: 'Phone number is not verified'
				});
			
			const logRef = await this.loginLogs.findOne({ refId: result.id as string });
			if (!logRef) {
				const newLog = new this.loginLogs({
					refId: result.id as string,
					logs: [ { ...headers, date: Date(), ip: ip } ]
				})
				const res = newLog.save();
				if (res)
					return ({
						statusCode: 200,
						statusMessage: 'Logged In',
						authToken: TokenizationClass.GenerateToken({ id: (result.id as string) })
					});
				else
					return ({
						statusCode: 500,
						statusMessage: 'Not able to login'
					})
			}
			else {
				const updatedLog = await this.loginLogs.findByIdAndUpdate(logRef.id, { $push: { logs: { ...headers, date: Date(), ip: ip } } },{ returnOriginal: false });
				if (updatedLog)
					return ({
						statusCode: 200,
						statusMessage: 'Logged In',
						authToken: TokenizationClass.GenerateToken({ id: (result.id as string) })
					});
				else
					return ({
						statusCode: 500,
						statusMessage: 'Not able to login'
					});
			}
			
		}
	}
	public async LoginGateway(credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}, headers: Headers, ip: string) {
		if ('emailId' in credentials && 'password' in credentials) {
			if (!(ValidatorClass.validateEmail(credentials.emailId)) && !(ValidatorClass.validatePassword(credentials.password))) {
				return ({
					statusCode: 400,
					statusMessage: 'Provided Credentials are invalid'
				});
			}
			else {
				return await this.Login(credentials, headers, ip);
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
				return await this.Login(credentials, headers, ip);
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
					statusCode: 201,
					emailVerificationurl: `${process.env.URL}:${process.env.PORT}/user/verify-email?email=${ account.emailId }&token=${ newToken.verificationToken }`,
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
					statusCode: 'New OTP generated',
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

	//================ Api for confirming email
	private async confirmEmail(credentials: { emailId: string, verificationToken: string }) {
		const getObject = await this.account.findOne({ emailId: credentials.emailId });
		if (!getObject) {
			return ({
				statusCode: 404,
				statusMessage: 'Email Not found'
			});
		}
		else if (getObject.verificationStatus.email === VerificationStatus.VERIFIED) {
			return ({
				statusCode: 400,
				statusMessage: 'Email already verified'
			});
		}
		else {
			const verify = await this.verification.VerifyEmail({ refId: getObject.id, verificationToken: credentials.verificationToken });
			if (verify.statusCode === 201) {
				const update = await this.account.findByIdAndUpdate(getObject.id, { verificationStatus: { email: VerificationStatus.VERIFIED, phone: getObject.verificationStatus.phone } }, { returnOriginal: false });
				if (update) {
					return ({
						statusCode: 201,
						statusMessage: 'Email verified'
					});
				}
				else {
					return ({
						statusCode: 500,
						statusMessage: 'Unable to verify the email'
					});
				}
			}
		}
	}
	public async confirmEmailGateway(credentials: { emailId: string, verificationToken: string }) {
		if (ValidatorClass.validateEmail(credentials.emailId) && credentials.verificationToken.length === 64) {
			return await this.confirmEmail(credentials);
		}
		else { 
			return ({
				statusCode: 400,
				statusMessage: 'Provided credentials are invalid'
			});
		}
	}

	//================ Api for Verifying OTP
	private async verifyOTP(credentials: { phone: string | number, OTP: number }) {
		const getObject = await this.account.findOne({ phone: credentials.phone.toString() });
		if (!getObject) {
			return ({
				statusCode: 404,
				statusMessage: 'Phone Number Not found'
			});
		}
		else if (getObject.verificationStatus.phone === VerificationStatus.VERIFIED) {
			return ({
				statusCode: 400,
				statusMessage: 'Phone Number already verified'
			});
		}
		else {
			const verify = await this.verification.VerifyOTP({ refId: getObject.id, OTP: credentials.OTP });
			if (verify.statusCode === 201) {
				const update = await this.account.findByIdAndUpdate(getObject.id, { verificationStatus: { phone: VerificationStatus.VERIFIED, email: getObject.verificationStatus.email } }, { returnOriginal: false });
				if (update) {
					return ({
						statusCode: 201,
						statusMessage: 'Phone Number verified'
					});
				}
				else {
					return ({
						statusCode: 500,
						statusMessage: 'Unable to verify Phone Number'
					});
				}
			}
		}
	}
	public async verifyOTPGateway(credentials: { phone: string | number, OTP: number }) {
		if (ValidatorClass.validatePhone(credentials.phone)) {
			return await this.verifyOTP(credentials);
		}
		else { 
			return ({
				statusCode: 400,
				statusMessage: 'Provided Phone Number is invalid'
			});
		}
	}

	//================ Api for retreiving User Details
	private async getUserDetails(id: string, fields: string[] = []) {
		const find = await this.account.findById(id);
		if (!find) return ({ statusCode: 404, statusMessage: 'user not found' });
		else {
			if (fields.length > 0) {
				const keys = [ 'id', 'firstName', 'lastName', 'emailId', 'phone', 'createdAt' ];
				const userDetails: { 
					id?: string,
					firstName?: string, 
					lastName?: string,
					emailId?: string,
					phone?: string,
					createdAt?: string,
				} = {};
				for (const field of fields) {
					for (const key of keys) {
						if ((key.toLowerCase()).includes(field.toLowerCase())) {
							userDetails[key] = find[key];
						}
					}
				}
				return ({
					statusCode: 201,
					statusMessage: 'User Details fetched',
					userDetails: userDetails
				});
			}
			else {
				return ({
					statusCode: 201,
					statusMessage: 'User Details fetched',
					userDetails: {
						id: find.id,
						firstName: find.firstName,
						lastName: find.lastName,
						emailId: find.emailId,
						phone: find.phone,
						createdAt: find.createdAt
					}
				});
			}
		}
	}
	public async getUserDetailsGateway(authenticationToken: string, fields: string[] = []) {
		try {
			const { data: { id: tokenValue } } = TokenizationClass.DecodeToken(authenticationToken);
			return await this.getUserDetails(tokenValue, fields);
		}
		catch (e: unknown) {
			return ({
				statusCode: 400,
				error: e as VerifyErrors,
				statusMessage: 'Error in Token Verification'
			});
		}
	}

	//================ Api for requesting for Authority upgrade
	private async requestForAuthorityUpgrade(id: string, authorityToUpgrade: Authority) {
		const find = await this.account.findById(id);
		if (!find)
			return ({
				statusCode: 404,
				statusMessage: 'Account not found'
			});
		
		const searchForRequest = await this.requests.findOne({ refId: find.id }).exec();
		console.log(searchForRequest);
		if (searchForRequest)
			return ({
				statusCode: 400,
				statusMessage: 'One request Already found'
			});
		else if (authorityToUpgrade === Authority.CLIENT)
			return ({
				statusCode: 400,
				statusMessage: 'Cannot change to client'
			});
		else if (find.Authority === Authority.SUPERUSER)
			return ({
				statusCode: 400,
				statusMessage: 'User already Super User'
			});
		else if (
			find.Authority === Authority.ADMINISTRATOR && 
			(authorityToUpgrade === Authority.ADMINISTRATOR ||
			authorityToUpgrade === Authority.SUPERUSER
			))
			return ({
				statusCode: 400,
				statusMessage: 'Cannot upgrade authority to Administrator'
			});
		else if (find.Authority === Authority.MIDTIERUSER && authorityToUpgrade === Authority.MIDTIERUSER)
			return ({
				statusCode: 400,
				statusMessage: 'Already a Midtier User'
			});
		else {
			const requestStatus = new this.requests({
				requestType: RequestTypes.AUTHORITY_UPGRADE,
				authorityToUpgrade: authorityToUpgrade,
				refId: find.id
			});

			try {
				const result = await requestStatus.save();
				if (result)
					return ({
						statusCode: 201,
						statusMessage: 'Request submitted successfully'
					});
			}
			catch (e: unknown) {
				return ({
					statusCode: 500,
					statusMessage: 'Unknown Error',
					error: e
				});
			}
		}
	}
	public async requestForAuthorityUpgradeGateway(authenticationToken: string, authorityToUpgrade: 'super' | 'administrator' | 'mid-tier') {
		try {
			const { data: { id: tokenValue } } = TokenizationClass.DecodeToken(authenticationToken);
			const upgrade = authorityToUpgrade === 'super' ? Authority.SUPERUSER :
							authorityToUpgrade === 'administrator' ? Authority.ADMINISTRATOR:
							authorityToUpgrade === 'mid-tier' ? Authority.MIDTIERUSER : undefined;
			if (upgrade !== undefined)
				return await this.requestForAuthorityUpgrade(tokenValue, upgrade);
			else
				return ({
					statusCode: 400,
					statusMessage: 'Authority request is not defined'
				});
		}
		catch (e: unknown) {
			return ({
				statusCode: 400,
				error: e as VerifyErrors,
				statusMessage: 'Error in Token Verification'
			});
		}
	}

	//================ Api for requesting for Forgot Password
	private async RequestForForgotPassword(emailId: string) {
		const findAccount = await this.account.findOne({ emailId: emailId }).exec();
		if (!findAccount)
			return ({
				statusCode: 404,
				statusMessage: 'Email Not found'
			});
		else {
			const searchRequest = await this.requests.findOne({ refId: findAccount.id, requestType: RequestTypes.FORGOT_PASSWORD });
			if (!searchRequest) {
				const forgotPasswordRequestToken = TokenizationClass.GenerateToken({ id: v4() }).split('_!')[1];
				const newRequest = new this.requests({
					refId: findAccount.id,
					requestType: RequestTypes.FORGOT_PASSWORD,
					forgotPasswordRequestToken: forgotPasswordRequestToken
				});
				const result = await newRequest.save();
				if (!result)
					return ({
						statusCode: 501,
						statusMessage: 'Unable to parse request'
					});
				return ({
					statusCode: 201,
					statusMessage: 'Request Created',
					url: `${ process.env.URL }:${ process.env.PORT }/user/request-reset-password/${ encodeURI(result.forgotPasswordRequestToken) }`
				});
			}
			else {
				const forgotPasswordRequestToken = TokenizationClass.GenerateToken({ id: v4() }).split('_!')[1];
				searchRequest.forgotPasswordRequestToken = forgotPasswordRequestToken;
				const result = await searchRequest.save();
				return ({
					statusCode: 201,
					statusMessage: 'Request Created',
					url: `${ process.env.URL }:${ process.env.PORT }/user/request-reset-password/${ encodeURI(result.forgotPasswordRequestToken) }`
				});
			}
		}
	}
	public async RequestForForgotPasswordGateway(credentials: { emailId: string }) {
		if (!('emailId' in credentials) || !(ValidatorClass.validateEmail(credentials.emailId)))
			return ({
				statusCode: 400,
				statusMessage: 'Email Id is invalid or not present'
			});
		else {
			return await this.RequestForForgotPassword(credentials.emailId);
		}
	}

	//================ Api for Confirming Reset Password
	private async requestResetPassword(refId: string) {
		const findRequest = await this.requests.findOne({ requestType: RequestTypes.RESET_PASSWORD, refId: refId });
		if (!findRequest || findRequest.resetStatus === ResetStatus.SET) {
			const resetPasswordToken = TokenizationClass.GenerateToken({ id: v4() }).split('_!')[1];
			const newRequest = new this.requests({
				refId: refId,
				requestType: RequestTypes.RESET_PASSWORD,
				resetPasswordToken: resetPasswordToken,
				resetStatus: ResetStatus.UNSET
			});
			const res = await newRequest.save();
			if (!res)
				return ({
					statusCode: 501,
					statusMessage: 'Unable to parse Request'
				});
			else {
				return ({
					url: `${ process.env.URL }:${ process.env.PORT }/user/reset-password?resId=${ encodeURI(res.resetPasswordToken) }`,
					statusCode: 201,
					statusMessage: 'Follow the url to change the password'
				});
			}
		}
		else {
			const resetPasswordToken = TokenizationClass.GenerateToken({ id: v4() }).split('_!')[1];
			findRequest.resetPasswordToken = resetPasswordToken;
			const res = await findRequest.save();
			if (!res)
				return ({
					statusCode: 500,
					statusMessage: 'Unable to parse Request',
				});
			return ({
				url: `${ process.env.URL }:${ process.env.PORT }/user/reset-password?resId=${ encodeURI(res.resetPasswordToken) }`,
				statusCode: 201,
				statusMessage: 'Follow the url to change the password'
			});
		}
	}
	public async requestResetPasswordGateway(requestToken: string) {
		const findRequest = await this.requests.findOne({ requestType: RequestTypes.FORGOT_PASSWORD, forgotPasswordRequestToken: requestToken }).exec();
		if (!findRequest)
			return ({
				statusCode: 404,
				statusMessage: 'Request Not Found'
			});
		else {
			return await this.requestResetPassword(decodeURI(findRequest.refId));
		}
	}

	//================ Api for Reseting password
	private async resetPassword(refId: string, password: string, requestId: string) {
		const getAccount = await this.account.findById(refId);
		if (!getAccount) 
			return ({
				statusCode: 404,
				statusMessage: 'Account not found'
			});
		else {
			const res = await this.account.findByIdAndUpdate(refId, { password: password }).exec();
			console.log('result', res);
			if (!res)
				return ({
					statusCode: 501,
					statusMessage: 'Unable to update password'
				});
			else {
				const updateRequest = await this.requests.findByIdAndUpdate(requestId, { resetStatus: ResetStatus.SET }).exec();
				if (updateRequest)
					return ({
						statusCode: 201,
						statusMessage: 'Password updated successfully'
					});
				else
					return ({
						statusCode: 501,
						statusMessage: 'Unable to update password'
					});
			}
		}
	}
	public async resetPasswordGateway(resId: string, data: { password: string }) {
		if (!resId || !data)
			return ({
				statusCode: 400,
				statusMessage: 'Invalid credentials or credentials not present'
			});
		
		const getRequest = await this.requests.findOne({ resetPasswordToken: resId });
		if (!getRequest)
			return({
				statusCode: 404,
				statusMessage: "Request not found"
			});
		else if (!ValidatorClass.validatePassword(data.password))
			return ({
				statusCode: 400,
				statusMessage: 'Password not met the criteria, please try a strong password'
			});
		else if (getRequest.resetStatus === ResetStatus.SET)
			return ({
				statusCode: 400,
				statusMessage: 'URL already used, resend request'
			});
		else
			return await this.resetPassword(getRequest.refId, data.password, getRequest.id);
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
	}, headers: Headers, ip: string) {
		return await this.authenticate.LoginGateway(credentials, headers, ip);
	}
	public async requestForNewEmailToken(credentials: { emailId: string }) {
		return await this.authenticate.requestEmailVerificationTokenGateway(credentials);
	}
	public async requestForNewOTP(credentials: { phone: string | number }) {
		return await this.authenticate.requestOTPGateway(credentials);
	}
	public async verifyEmail(credentials: { emailId: string, verificationToken: string }) {
		return await this.authenticate.confirmEmailGateway(credentials);
	}
	public async verifyOTP(credentials: { phone: string | number, OTP: number }) {
		return await this.authenticate.verifyOTPGateway(credentials);
	}
	public async getUserDetails(authenticationToken: string, fields: string[] = []) {
		return await this.authenticate.getUserDetailsGateway(authenticationToken, fields);
	}
	public async requestForUpgradeAuthority(authenticationToken: string, authorityToUpgrade: 'super' | 'administrator' | 'mid-tier') {
		return await this.authenticate.requestForAuthorityUpgradeGateway(authenticationToken, authorityToUpgrade);
	}
	public async requestForForgotPassword(credentials: { emailId: string }) {
		return await this.authenticate.RequestForForgotPasswordGateway(credentials);
	}
	public async requestResetPassword(requestToken: string) {
		return await this.authenticate.requestResetPasswordGateway(requestToken);
	}
	public async resetPassword(resId: string, data: { password: string }) {
		return await this.authenticate.resetPasswordGateway(resId, data);
	}
}
