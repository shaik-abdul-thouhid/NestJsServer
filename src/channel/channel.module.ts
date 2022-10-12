import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { ChannelService, RequestService } from "./channel.service";
import { ChannelController } from "./channel.controller";

import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { ChannelModel } from './channel.model';

config();

@Module({
	imports: [ 
		MongooseModule.forRoot(`${ process.env.DATABASE_URL }/channel`),
		MongooseModule.forFeature([
			{ name: 'Channel', schema: ChannelModel },
		]),
		HttpModule.registerAsync({
			useFactory: () => ({ timeout: 10000, maxRedirects: 5 }),
		}),
	],
	providers: [ 
		ChannelService,
		RequestService
	],
	controllers: [ ChannelController ]
})
export class ChannelModule {}