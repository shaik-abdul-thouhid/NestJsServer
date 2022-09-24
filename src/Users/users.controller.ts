import { Controller, Post, Get, Body, Header } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('new-user')
	@Header('X-Powered-By', 'Minitube')
	public async createAccount(@Body('credentials') credentials: {
		firstName: string,
		lastName: string,
		emailId: string,
		phone: string | number,
		password: string
	}) {
		return await this.usersService.createAccount(credentials);
	}

	@Get('login')
	@Header('X-Powered-By', 'MiniTube')
	public async Login(@Body('credentials') credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}) {
		return await this.usersService.Login(credentials);
	}

	@Get('new-email-token')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForNewEmailToken(@Body('credentials') credentials: { emailId: string }) {
		return await this.usersService.requestForNewEmailToken(credentials);
	}
	@Get('new-otp')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForNewOTP(@Body('credentials') credentials: { phone: string | number }) {
		return await this.usersService.requestForNewOTP(credentials);
	}
}