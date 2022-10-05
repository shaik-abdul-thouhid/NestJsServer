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

	public async getUserDetails(req: Request, fields: string[] = []) {
		if (!(req.headers['Authorization'] || req.headers['authorization'])) 
			return ({ 
				statusCode: 400, 
				statusMessage: 'Authorization Token not Found' 
			});
		const token: string = req.headers['Authorization'] as string || req.headers['authorization'] as string;
		const authenticationToken = token.split(' ');

		if (authenticationToken[0].toLowerCase() !== 'bearer')
			return ({
				statusCode: 400,
				statusMessage: 'Bearer Token not found',
			});
		else if (authenticationToken[1].length !== 313)
			return ({
				statusCode: 400,
				statusMessage: 'Invalid Authentication Token'
			});
		return await this.authService.getUserDetails(authenticationToken[1], fields);
	}

	public async RequestForAuthorityUpgrade(req: Request, requestedAuthority: string) {
		if (!(req.headers['Authorization'] || req.headers['authorization'])) 
			return ({ 
				statusCode: 400, 
				statusMessage: 'Authorization Token not Found' 
			});
		const token: string = req.headers['Authorization'] as string || req.headers['authorization'] as string;
		const authenticationToken = token.split(' ');

		if (authenticationToken[0].toLowerCase() !== 'bearer')
			return ({
				statusCode: 400,
				statusMessage: 'Bearer Token not found',
			});
		else if (authenticationToken[1].length !== 313)
			return ({
				statusCode: 400,
				statusMessage: 'Invalid Authentication Token'
			});
		else if (requestedAuthority !== 'super' && requestedAuthority !== 'administrator' && requestedAuthority !== 'mid-tier')
			return ({
				statusCode: 400,
				statusMessage: 'Invalid request for authority'
			});
		else
			return await this.authService.requestForUpgradeAuthority(authenticationToken[1], requestedAuthority);
	}
}