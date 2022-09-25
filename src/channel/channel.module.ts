import { Module } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { ChannelController } from "./channel.controller";
import { UsersModule } from '../Users/users.module';
import { UsersService } from '../Users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { AuthService, AuthenticationClass, VerificationClass } from '../auth/auth.service';
import { AccountModel, EmailVerificationModel, PhoneVerificationModel, LoginLogsModel } from '../auth/auth.model';
config();

@Module({
	imports: [ 
		UsersModule, 
		MongooseModule.forRoot(`${ process.env.DATABASE_URL }/channels`),
		MongooseModule.forFeature([ 
			{ name: 'Accounts', schema: AccountModel },
			{ name: 'EmailVerification', schema: EmailVerificationModel },
			{ name: 'PhoneVerification', schema: PhoneVerificationModel },
			{ name: 'LoginLogs', schema: LoginLogsModel }
		])
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