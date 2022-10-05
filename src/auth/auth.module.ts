import { Module } from '@nestjs/common';
import { AuthenticationClass, AuthService, VerificationClass } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModel, EmailVerificationModel, PhoneVerificationModel, LoginLogsModel, RequestsModel } from './auth.model';
import { config } from 'dotenv';
config();

@Module({
	imports: [ 
		MongooseModule.forRoot(`${ process.env.DATABASE_URL }/Auth`),
		MongooseModule.forFeature([ 
			{ name: 'Accounts', schema: AccountModel },
			{ name: 'EmailVerification', schema: EmailVerificationModel },
			{ name: 'PhoneVerification', schema: PhoneVerificationModel },
			{ name: 'LoginLogs', schema: LoginLogsModel },
			{ name: 'Requests', schema: RequestsModel }
		])
	],
	providers: [ AuthService, AuthenticationClass, VerificationClass ],
	exports: [ AuthService, AuthenticationClass, VerificationClass ],
})
export class AuthModule {}
