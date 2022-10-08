import { Controller, Post, Header, } from "@nestjs/common";
// import { ChannelAccess } from "./channel.model";
import { ChannelService } from "./channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Post('new-channel')
	@Header('X-Powered-By', 'MiniTube')
	public async CreateNewChannel() {
		return await this.channelService.test();
	}
}
