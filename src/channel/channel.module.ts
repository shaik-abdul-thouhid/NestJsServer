import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { ChannelService } from "./channel.service";
import { ChannelController } from "./channel.controller";

import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { ChannelModel } from './channel.model';

config();

@Module({
	imports: [ 
		MongooseModule.forRoot(`${ process.env.DATABASE_URL }/channels`),
		MongooseModule.forFeature([
			{ name: 'Channel', schema: ChannelModel },
		]),
		HttpModule
	],
	providers: [ 
		ChannelService,
	],
	controllers: [ ChannelController ]
})
export class ChannelModule {}