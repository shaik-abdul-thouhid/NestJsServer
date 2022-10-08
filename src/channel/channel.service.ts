import { Injectable } from '@nestjs/common';
import { Channel, ChannelAccess } from './channel.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { v4 } from 'uuid';

@Injectable()
export class ChannelService {
	constructor(
		@InjectModel('Channel') private readonly channel: Model<Channel>,
		private readonly http: HttpService
	) {}

	//=================== Api for creating a new Channel
	public async test() {
		const test = new this.channel({
			channelUiD: v4(),
			channelName: 'test',
			refId: '633f149785d3ecf73afedf14',
			subscriptions: [],
			numberOfVideos: 1,
			numberOfPlaylists: 2,
			createdOn: Date(),
			channelAccess: ChannelAccess.PUBLIC
		});
		const result = await test.save();
		if (result)
			return ({
				id: result.id,
				channelName: result.channelName,
				UiD: result.channelUiD
			});
		else
			return ({
				statusCode: 500,
				statusMessage: 'Unable to create channel'
			});
	}
	
}