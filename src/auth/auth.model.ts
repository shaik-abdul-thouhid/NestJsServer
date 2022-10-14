import { Schema } from "mongoose";

export const AccountModel = new Schema({
	UiD: { type: String, required: true, unique: true, immutable: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: false },
	emailId: { type: String, required: true, unique: true },
	phone: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	Authority: { type: Number, required: true },
	countryCode: { type: String, required: true },
	verificationStatus: { type: {
		email: { type: Number, required: true },
		phone: { type: Number, required: true }
	}, required: true, default: false },
	createdAt: { type: String, required: true, immutable: true }
});

export interface Account {
	UiD: string,
	firstName: string,
	lastName: string,
	emailId: string,
	countryCode: string,
	phone: string,
	password: string,
	Authority: Authority,
	verificationStatus: {
		email: VerificationStatus,
		phone: VerificationStatus
	},
	createdAt: string
}

export const EmailVerificationModel = new Schema({
	emailId: { type: String, required: true },
	verificationToken: { type: String, required: true },
	expiryDate: { type: Number, required: true },
	refId: { type: Schema.Types.ObjectId, required: true },
	verificationStatus: { type: Number, required: true },
	verifiedOn: { type: String, required: true }
});

export interface EmailVerification {
	emailId: string,
	verificationToken: string,
	expiryDate: number,
	refId: string,
	verificationStatus: VerificationStatus,
	verifiedOn: string
}

export const PhoneVerificationModel = new Schema({
	countryCode: { type: String, required: true },
	phone: { type: String, required: true },
	OTP: { type: Number, required: true },
	expiryDate: { type: Number, required: true },
	refId: { type: Schema.Types.ObjectId, required: true },
	verificationStatus: { type: Number, required: true },
	verifiedOn: { type: String, required: true }
});

export interface PhoneVerification {
	countryCode: string,
	OTP: number,
	expiryDate: number,
	refId: string,
	verificationStatus: VerificationStatus,
	verifiedOn: string
}

export enum Authority {
	SUPERUSER = 0xF0000,
	ADMINISTRATOR = 0x0F000,
	MIDTIERUSER = 0x00F00,
	CLIENT = 0x000F0
}

export enum VerificationStatus {
	VERIFIED = 0X0E00,
	NOTVERIFIED = 0X00E0
}

export const LoginLogsModel = new Schema({
	refId: { type: Schema.Types.ObjectId, required: true },
	logs: { type: [Schema.Types.Mixed], required: true }
});
export interface LoginLogs {
	refId: string,
	logs: unknown[]
}

export enum RequestTypes {
	AUTHORITY_UPGRADE = 0x00000D,
	FORGOT_PASSWORD = 0x0000D0,
	RESET_PASSWORD = 0x000D00,
}

export enum ResetStatus {
	UNSET = 0x0a,
	SET = 0xa0
}

export const RequestsModel = new Schema({
	refId: { type: Schema.Types.ObjectId, required: true },
	requestType: { type: Number },
	authorityToUpgrade: { type: Number },
	forgotPasswordRequestToken: { type: String },
	resetPasswordToken: { type: String },
	resetStatus: { type: Number, }
});

export interface Requests {
	refId: string,
	requestType: RequestTypes,
	authorityToUpgrade?: Authority.MIDTIERUSER | Authority.ADMINISTRATOR | Authority.SUPERUSER,
	forgotPasswordRequestToken?: string,
	resetPasswordToken?: string,
	resetStatus?: ResetStatus
}

export const UserModel = new Schema({
	refId: { type: Schema.Types.ObjectId, required: true, unique: true, immutable: true },
	DOB: { type: {
		date: { type: Number, required: true },
		month: { type: Number, required: true },
		year: { type: Number, required: true }
	}, required: true },
	gender: { type: String, required: true },
	BankDetails: { type: {
		Customer_Id: { type: String, required: true },
		name: { type: String, required: true },
		street: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		PIN: { type: String, require: true },
		emailId: { type: String, required: true },
		phone: { type: String, required: true }
	} },
	city: { type: String },
	PIN: { type: String },
	country: { type: String }
});

export enum GenderEnum {
	MALE = 'MALE',
	male = 'MALE',
	Male = 'MALE',
	FEMALE = 'FEMALE',
	Female = 'FEMALE',
	female = 'FEMALE',
	Others = 'OTHERS',
	others = 'OTHERS',
	OTHERS = 'OTHERS',
	None = 'NONE',
	none = 'NONE',
	NONE = 'NONE'
}

export interface User {
	refId: string,
	DOB: { date: number, month: number, year: number },
	gender: GenderEnum
	BankDetails?: {
		Customer_Id: string,
		name: string,
		street: string,
		city: string,
		state: string,
		PIN: string,
		emailId: string,
		phone: string
	},
	city: string,
	PIN: string,
	country: string
}