import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { networkInterfaces } from 'os';
import { config } from 'dotenv';
config();

(async function () {
	const app = await NestFactory.create(AppModule);
	
	app.enableCors();
	await app.listen(process.env.PORT || 3000, () => {
		const ip = networkInterfaces();
		console.log(`\nServer Started on: http://${ip['WiFi'] ? (ip['WiFi'][ip['WiFi'].length - 1]['address']) : 'localhost'}:${ process.env.PORT ? process.env.PORT : 3000 }/`);
	});
})();
