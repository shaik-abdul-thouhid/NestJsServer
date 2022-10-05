import { Injectable } from '@nestjs/common';
import { UsersService } from '../Users/users.service';
import { ChannelAccess, Channel } from './channel.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 } from 'uuid';

@Injectable()
export class ChannelService {
	constructor(
		private readonly usersService: UsersService,
		@InjectModel('Channel') private readonly channel: Model<Channel>
	) {}

	//=================== Api for creating a new Channel
	private async CreateNewChannel(refId: string, channelData: { channelName: string, channelAccess?: ChannelAccess }) {
		const newChannel = new this.channel({
			channelUiD: v4(),
			channelName: channelData.channelName,
			refId: refId,
			subscriptions: [],
			numberOfVideos: 0,
			numberOfPlaylists: 0,
			createdOn: Date(),
			channelAccess: channelData.channelAccess
		});
		const result = await newChannel.save();
		if (!result) return ({
			statusCode: 500,
			statusMessage: 'Unable to create channel, please try again'
		});
		return ({
			statusCode: 201,
			statusMessage: 'Channel Created successfully',
			channelUiD: result.channelUiD
		});
	}
	public async CreateNewChannelGateway(req: Request, channelData: { channelName: string, channelAccess?: string }) {
		const getUserDetails = await this.usersService.getUserDetails(req);
		if (getUserDetails.statusCode !== 201) return getUserDetails;
		else if ('userDetails' in getUserDetails && 'id' in getUserDetails.userDetails) {
			const searchForUsersChannel = await this.channel.findOne({ refId: getUserDetails.userDetails.id }).exec();
			if (!searchForUsersChannel) {
				if (!channelData.channelName || channelData.channelName === '' || channelData.channelName.length < 5)
					return ({
						statusCode: 400,
						statusMessage: 'Channel Name is invalid or too small, use name with length more than 5 characters'
					});
				const searchForChannelName = await this.channel.findOne({ channelName: channelData.channelName }).exec();
				if (!searchForChannelName) {
					if ('channelAccess' in channelData) {
						if (channelData.channelAccess === 'private') {
							return await this.CreateNewChannel(getUserDetails.userDetails.id as string, { channelName: channelData.channelName, channelAccess: ChannelAccess.PRIVATE });
						}
						else if (channelData.channelAccess === '' || channelData.channelAccess === 'public')
							return await this.CreateNewChannel(getUserDetails.userDetails.id as string, { channelName: channelData.channelName, channelAccess: ChannelAccess.PUBLIC });
						else return ({
							statusCode: 400,
							statusMessage: 'Invalid ChannelAccess Code'
						});
					}
					else if (!('channelAccess' in channelData))
						return await this.CreateNewChannel(getUserDetails.userDetails.id as string, { channelName: channelData.channelName, channelAccess: ChannelAccess.PUBLIC });
				}
				else {
					return ({
						statusCode: 403,
						statusMessage: 'Channel Name is already available, Try using a different Name',
					});
				}
			}
			else {
				return ({
					statusCode: 400,
					statusMessage: 'Channel Already exists',
				});
			}
		}
	}
}