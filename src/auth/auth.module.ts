import { Module } from '@nestjs/common';
import { AuthenticationClass, AuthService, VerificationClass } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModel, EmailVerificationModel, PhoneVerificationModel } from './auth.model';

@Module({
	imports: [ 
		MongooseModule.forRoot('mongodb://localhost/Auth'),
		MongooseModule.forFeature([ 
			{ name: 'Accounts', schema: AccountModel },
			{ name: 'EmailVerification', schema: EmailVerificationModel },
			{ name: 'PhoneVerification', schema: PhoneVerificationModel },

		])
	],
	providers: [ AuthService, AuthenticationClass, VerificationClass ],
	exports: [ AuthService, AuthenticationClass, VerificationClass ],
})
export class AuthModule {}
