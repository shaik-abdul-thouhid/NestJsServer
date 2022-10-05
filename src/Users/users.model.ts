import { Schema } from "mongoose";

export const UsersSchema = new Schema({
	refId: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	emailId: { type: String, required: true },
	createdAt: { type: String, required: true },
	phone: { type: String, required: true },
});

export interface Users {
	refId: string,
}