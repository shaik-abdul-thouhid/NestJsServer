import { Controller, Post, Header, Req, Request, Body } from "@nestjs/common";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Post('new-channel')
	@Header('X-Powered-By', 'MiniTube')
	public async CreateNewChannel(@Req() request: Request, @Body('data') newChannelData: { channelName: string, channelAccess?: 'public' | 'private' }) {
		return await this.channelService.CreateNewChannelGateway(request, newChannelData);
	}
}
