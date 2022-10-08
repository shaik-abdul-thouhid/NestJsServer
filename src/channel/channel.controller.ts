import { Controller, Post, Header, Req, Request, Body } from "@nestjs/common";
// import { ChannelAccess } from "./channel.model";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Post('new-channel')
	@Header('X-Powered-By', 'MiniTube')
	public async CreateNewChannel(
		@Req() request: Request, 
		@Body('data') channelData: { 
			channelName: string,
			channelAccess?: string
		}
	) {
		return await this.channelService.CreateNewChannelGateway(request, channelData);
	}
}
