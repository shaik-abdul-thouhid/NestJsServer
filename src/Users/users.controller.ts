import { Controller, Post, Get, Body, Header, Request, Req, } from '@nestjs/common';
import { UsersService } from './users.service';
import { getClientIp } from '@supercharge/request-ip';

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

	@Post('login')
	@Header('X-Powered-By', 'MiniTube')
	public async Login(@Body('credentials') credentials: {
		emailId: string,
		password: string
	} | {
		phone: string | number,
		password: string
	}, @Req() request: Request) {
		return await this.usersService.Login(credentials, request.headers, getClientIp(request));
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

	@Post('verify-email')
	@Header('X-Powered-By', 'MiniTube')
	public async VerifyEmail(@Body('credentials') credentials: { emailId: string, verificationToken: string }) {
		return await this.usersService.verifyEmail(credentials);
	}

	@Post('verify-otp')
	@Header('X-Powered-By', 'MiniTube')
	public async VerifyOTP(@Body('credentials') credentials: { phone: string | number, OTP: number }) {
		return await this.usersService.verifyOTP(credentials);
	}
}