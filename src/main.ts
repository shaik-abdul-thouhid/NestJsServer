import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { networkInterfaces } from 'os';
import { Authority } from './auth/auth.model';

(async function () {
	const app = await NestFactory.create(AppModule);
	
	app.enableCors();
	await app.listen(3000, () => {
		const ip = networkInterfaces();
		console.log(`\nServer Started on: http://${ip['WiFi'] ? (ip['WiFi'][ip['WiFi'].length - 1]['address']) : 'localhost'}:3000/`);
	});
})();
