import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { UsersModule } from './Users/users.module';
import { ChannelModule } from './channel/channel.module';
// import { firebaseConfig } from './firebase.config';
config();

(async function () {
	// nest instance for users Api's
	const users = await NestFactory.create(UsersModule);
	// nest instance for channel Api's
	const channel = await NestFactory.create(ChannelModule);

	users.enableCors(); channel.enableCors();
	await users.listen(process.env.ACCOUNT_PORT || 3333, async () => {
		console.log(`\nUsers Server Started at: ${ await users.getUrl() }`);
	});
	await channel.listen(process.env.CHANNEL_PORT || 4444, async () => {
		console.log(`\nChannel Server Started at: ${ await channel.getUrl() }`);
	});

})();
