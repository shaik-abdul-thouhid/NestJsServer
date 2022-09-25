import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UsersModule } from './Users/users.module';

@Module({
	imports: [ 
		AuthModule, 
		UsersModule,
		AdminModule,
		ChannelModule
	],
})
export class AppModule {}
