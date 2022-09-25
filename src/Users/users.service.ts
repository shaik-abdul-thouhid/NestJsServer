import { Injectable, Headers } from '@nestjs/common';
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UsersService {
	constructor(private readonly authService: AuthService) {}

	public async createAccount(params: {
		firstName: string,
		lastName: string,
		emailId: string,
		phone: string | number,
		password: string,
	}) {
		return await this.authService.createAccount(params);
	}

	public async Login(credentials: { 
		emailId: string, 
		password: string,
	} | {
		phone: string | number,
		password: string
	}, headers: Headers, ip: string) {
		return await this.authService.login(credentials, headers, ip);
	}

	public async requestForNewEmailToken(credentials: { emailId: string }) {
		return await this.authService.requestForNewEmailToken(credentials);
	}
	public async requestForNewOTP(credentials: { phone: string | number }) {
		return await this.authService.requestForNewOTP(credentials);
	}

	public async verifyEmail(credentials: { emailId: string, verificationToken: string }) {
		return await this.authService.verifyEmail(credentials);
	}
	public async verifyOTP(credentials: { phone: string | number, OTP: number }) {
		return await this.authService.verifyOTP(credentials);
	}
	
}