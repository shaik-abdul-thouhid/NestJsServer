import { Schema } from "mongoose";
import { v4 } from 'uuid';

export const AccountModel = new Schema({
	UiD: { type: String, required: true, default: v4() },
	firstName: { type: String, required: true },
	lastName: { type: String, required: false },
	emailId: { type: String, required: true },
	phone: { type: String, required: true },
	password: { type: String, required: true },
	Authority: { type: Number, required: true, default: 0x000F0 },
	verificationStatus: { type: {
		email: { type: Number, required: true, default: 224 },
		phone: { type: Number, required: true, default: 224 }
	}, required: true, default: false },
	createdAt: { type: String, required: true, default: Date() }
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
	createAt: string
}

export const EmailVerificationModel = new Schema({
	emailId: { type: String, required: true },
	verificationToken: { type: String, required: true },
	expiryDate: { type: Number, required: true },
	refId: { type: String, required: true },
	verificationStatus: { type: Number, required: true }
});

export interface EmailVerification {
	emailId: string,
	verificationToken: string,
	expiryDate: number,
	refId: string,
	verificationStatus: VerificationStatus
}

export const PhoneVerificationModel = new Schema({
	phone: { type: String, required: true },
	OTP: { type: Number, required: true },
	expiryDate: { type: Number, required: true },
	refId: { type: String, required: true },
	verificationStatus: { type: Number, required: true }
});

export interface PhoneVerification {
	emailId: string,
	OTP: number,
	expiryDate: number,
	refId: string,
	verificationStatus: VerificationStatus
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