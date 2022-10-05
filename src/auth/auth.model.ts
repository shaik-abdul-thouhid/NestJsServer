import { Schema } from "mongoose";

export const AccountModel = new Schema({
	UiD: { type: String, required: true, unique: true, immutable: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: false },
	emailId: { type: String, required: true, unique: true },
	phone: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	Authority: { type: Number, required: true },
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
	phone: { type: String, required: true },
	OTP: { type: Number, required: true },
	expiryDate: { type: Number, required: true },
	refId: { type: Schema.Types.ObjectId, required: true },
	verificationStatus: { type: Number, required: true },
	verifiedOn: { type: String, required: true }
});

export interface PhoneVerification {
	emailId: string,
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
	logs: any[]
}

export const RequestsModel = new Schema({
	requestType: { type: Number },
	authorityToUpgrade: { type: Number },
	refId: { type: Schema.Types.ObjectId, required: true }
});

export enum RequestTypes {
	AUTHORITY_UPGRADE = 0x00000D,
}

export interface Requests {
	refId: string,
	requestType: RequestTypes,
	authorityToUpgrade?: Authority.MIDTIERUSER | Authority.ADMINISTRATOR | Authority.SUPERUSER,
}