import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.exports';
import { AuthModule } from './auth/auth.exports';
import { ChannelModule } from './channel/channel.exports';
import { UsersModule } from './Users/users.exports';

@Module({
	imports: [ 
		AuthModule, 
		UsersModule,
		AdminModule,
		ChannelModule,
	],
})
export class AppModule {}
