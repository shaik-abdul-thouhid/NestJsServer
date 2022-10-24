import { Injectable, } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
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
		const p = params.password.slice(0, params.password.length - 128)
		const secret = params.password.slice(-128);
		try {
			const decoded = verify(p, secret) as string;
			params.password = decoded;
			return await this.authService.createAccount(params);
		}
		catch (e: unknown) {
			return ({
				statusCode: 404,
				statusMessage: 'Invalid Password Payload'
			});
		}
	}

	public async Login(credentials: { 
		emailId: string, 
		password: string,
	} | {
		phone: string | number,
		password: string
	}, headers: Headers, ip: string) {
		const p = credentials.password.slice(0, credentials.password.length - 128)
		const secret = credentials.password.slice(-128);
		try {
			const decoded = verify(p, secret) as string;
			credentials.password = decoded;
			return await this.authService.login(credentials, headers, ip);
		} catch (e: unknown) {
			return ({
				statusCode: 400,
				statusMessage: 'Invalid Password Payload'
			});
		}
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
		const p = data.password.slice(0, data.password.length - 128)
		const secret = data.password.slice(-128);
		try {
			const decoded = verify(p, secret) as string;
			data.password = decoded;
			return await this.authService.resetPassword(resId, data);
		} catch (err) {
			return ({
				statusCode: 400,
				statusMessage: 'Invalid Payload string'
			});
		}
	}
}