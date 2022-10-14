import { Injectable, Scope, Request } from '@nestjs/common';
import { Channel, ChannelAccess, Subscriptions } from './channel.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { v4 } from 'uuid';

config();

@Injectable({
	scope: Scope.TRANSIENT
})
export class RequestService {
	constructor(private readonly http: HttpService) {}

	/**
	 * 
	 * @param authToken string to contain Prefix Bearer || bearer followed by authtoken
	 * @returns 
	 */
	public async GetUserDetails(authToken: string) {
		const getUserDetails = await this.http.axiosRef.get(
			`${ process.env.URL }:${ process.env.ACCOUNT_PORT }/user`,
			{
				headers: {
					Authorization: authToken
				}
			}
		);
		return getUserDetails.data as { userDetails: { id: string, firstName: string, lastName: string, emailId: string, phone: string, createdAt: string }, statusCode: number, statusMessage: string };
	}
}

@Injectable()
export class ChannelService {
	constructor(
		@InjectModel('Channel') private readonly channel: Model<Channel>,
		@InjectModel('Subscriptions') private readonly subscriptions: Model<Subscriptions>,
		private readonly requestService: RequestService
	) {}

	//=================== Api for creating a new Channel
	private async CreateNewChannel(userDetails: {
		firstName: string,
		lastName: string,
		emailId: string,
		phone: string,
		id: string,
		createdAt: string
	}, newChannelData: { channelName: string, channelAccess?: ChannelAccess}) {
		const checkChannelAvailability = await this.channel.findOne({ refId: userDetails.id }).exec();
		
		if (!checkChannelAvailability) {
			const checkForChannelName = await this.channel.find({ channelName: newChannelData.channelName }).exec();

			if (checkForChannelName.length === 0) {
				const newChannel = await new this.channel({
					refId: userDetails.id,
					channelUiD: v4(),
					channelName: newChannelData.channelName,
					numberOfVideos: 0,
					numberOfPlaylists: 0,
					createdOn: Date(),
					channelAccess: newChannelData.channelAccess ? newChannelData.channelAccess : ChannelAccess.PUBLIC
				}).save();
				if (!newChannel)
					return ({
						statusCode: 500,
						statusMessage: 'Unable to create Channel'
					});
				return ({
					statusCode: 201,
					statusMessage: 'Channel Created',
					data: {
						UiD: newChannel.channelUiD,
					}
				});
			}
			else
				return ({
					statusCode: 400,
					statusMessage: 'Channel name already found, Use another name'
				});
		}
		else
			return ({
				statusCode: 400,
				statusMessage: 'Channel Alredy exists for given account'
			});
	}
	public async CreateNewChannelGateway(req: Request, newChannelData: { channelName: string, channelAccess?: 'public' | 'private' }) {
		const authToken = req.headers['Authorization'] || req.headers['authorization'];
		const getUser = await this.requestService.GetUserDetails(authToken);
		if (getUser.statusCode !== 201)
			return getUser;
		else if (!newChannelData && !('channelName' in newChannelData))
			return ({
				statusCode: 400,
				statusMessage: 'Invalid request, no data provided'
			});
		else if (newChannelData.channelName.length < 6 || newChannelData.channelName.length > 20)
			return ({
				statusCode: 400,
				statusMessage: 'Please Use a channel Name between 6 to 20 characters'
			});

		const channelData = {
			channelName: newChannelData.channelName,
			channelAccess: (!('channelAccess' in newChannelData) || newChannelData.channelAccess === 'public' || newChannelData.channelAccess !== 'private') ? ChannelAccess.PUBLIC
							: ChannelAccess.PRIVATE,
		};
		return await this.CreateNewChannel(getUser.userDetails, channelData);
	}
}