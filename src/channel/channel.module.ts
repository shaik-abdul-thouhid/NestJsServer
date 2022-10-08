import { Module } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { ChannelController } from "./channel.controller";
import { UsersModule, UsersService } from '../Users/users.exports';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { AuthService, AuthenticationClass, VerificationClass, AccountModel, EmailVerificationModel, PhoneVerificationModel, LoginLogsModel, RequestsModel } from '../auth/auth.exports';
import { ChannelModel } from './channel.model';
config();

@Module({
	imports: [ 
		MongooseModule.forRoot(`${ process.env.DATABASE_URL }/channels`),
		MongooseModule.forFeature([
			{ name: 'Accounts', schema: AccountModel },
			{ name: 'EmailVerification', schema: EmailVerificationModel },
			{ name: 'PhoneVerification', schema: PhoneVerificationModel },
			{ name: 'LoginLogs', schema: LoginLogsModel },
			{ name: 'Requests', schema: RequestsModel },
			{ name: 'Channel', schema: ChannelModel },
		]),
		UsersModule,
	],
	providers: [ 
		ChannelService, 
		UsersService, 
		AuthService, 
		AuthenticationClass, 
		VerificationClass 
	],
	controllers: [ ChannelController ]
})
export class ChannelModule {}