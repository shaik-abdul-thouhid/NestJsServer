import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { networkInterfaces } from 'os';
import { config } from 'dotenv';
config();

(async function () {
	const app = await NestFactory.create(AppModule);
	
	app.enableCors();
	await app.listen(process.env.PORT || 3000, async () => {
		console.log(`\nServer Started on: ${ await app.getUrl() }`);
	});
})();
