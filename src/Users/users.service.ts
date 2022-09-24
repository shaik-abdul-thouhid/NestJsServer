import { Injectable } from '@nestjs/common';
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
		password: string 
	} | {
		phone: string | number,
		password: string
	}) {
		return await this.authService.login(credentials);
	}

	public async requestForNewEmailToken(credentials: { emailId: string }) {
		return await this.authService.requestForNewEmailToken(credentials);
	}
	public async requestForNewOTP(credentials: { phone: string | number }) {
		return await this.authService.requestForNewOTP(credentials);
	}
	
}