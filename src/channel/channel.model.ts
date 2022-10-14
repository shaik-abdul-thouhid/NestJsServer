import { Schema } from 'mongoose';

export enum ChannelAccess {
	PUBLIC = 0x0A,
	PRIVATE = 0xA0
}

export const ChannelModel = new Schema({
	channelUiD: { type: String, required: true, unique: true, immutable: true },
	channelName: { type: String, required: true, unique: true, immutable: true },
	refId: { type: Schema.Types.ObjectId, required: true, unique: true, immutable: true },
	numberOfVideos: { types: Number },
	numberOfPlaylists: { types: Number },
	createdOn: { type: String, required: true },
	channelAccess: { type: Number, required: true, default: 10 },
});

export interface Channel {
	channelUiD: string,
	channelName: string,
	refId: string,
	numberOfVideos: number,
	numberOfPlaylists: number,
	createdOn: string,
	channelAccess: ChannelAccess
}

export const SubscriptionsModel = new Schema({
	refId: { type: Schema.Types.ObjectId, required: true, unique: true, immutable: true },
	subscriptions: { 
		type: [{ 
			subscribedUserId: { type: Schema.Types.ObjectId, required: true, }, 
			subscribedOn: { type: String, required: true, } 
		}], 
		required: true 
	},
});

export interface Subscriptions {
	refId: string,
	subscriptions: {
		subscribedUserid: string,
		subscribedOn: string
	}[]
}
