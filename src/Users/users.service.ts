import { Injectable, } from '@nestjs/common';
import { AuthService } from "src/auth/auth.exports";

@Injectable()
export class UsersService {
	constructor(private readonly authService: AuthService) {}

	public async createAccount(params: {
		firstName: string,
		lastName?: string,
		emailId: string,
		countryCode: string,
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
	public async requestForNewOTP(credentials: { countryCode: string, phone: string | number }) {
		return await this.authService.requestForNewOTP(credentials);
	}

	public async verifyEmail(emailId: string, verificationToken: string) {
		if (!emailId || !verificationToken)
			return ({
				statusCode: 400,
				statusMessage: 'Invalid URL'
			});
		return await this.authService.verifyEmail({ emailId: emailId, verificationToken: verificationToken });
	}
	public async verifyOTP(credentials: { phone: string | number, OTP: number }) {
		return await this.authService.verifyOTP(credentials);
	}

	public async getUserDetails(req: Request, fields: { id?: string, name?: string, email?: string, phone?: string, createdAt?: string }) {
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

		const requests: string[] = [];
		for (const key in fields) {
			if (fields[key] === 'true') requests.push(key);
		}
		return await this.authService.getUserDetails(authenticationToken[1], requests);
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

	public async RequestForForgotPassword(credentials: { emailId: string }) {
		return await this.authService.requestForForgotPassword(credentials);
	}

	public async RequestResetPassword(requestToken: string) {
		if (requestToken === '' || requestToken === undefined)
			return ({
				statusCode: 400,
				statusMessage: 'Parameters undefined'
			});
		else return await this.authService.requestResetPassword(requestToken);
	}

	public async ResetPassword(resId: string, data: { password: string }) {
		return await this.authService.resetPassword(resId, data);
	}
}