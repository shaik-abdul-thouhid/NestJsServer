import { 
	Controller, 
	Post, 
	Put,
	Get,
	Query, 
	Body, 
	Header, 
	Request, 
	Req, 
	Param,
	UploadedFile,
	UseInterceptors,
	// Response
} from '@nestjs/common';
import { UsersService } from './users.service';
import { getClientIp } from '@supercharge/request-ip';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

/**
 * @Controller for routers related to users\
 * 1. Create Account - `POST` /user/new-user
 * 2. Login - `POST` /user/login
 * 3. RequestForNewEmailToken - `POST` /user/new-email-token
 * 4. RequestForNewOTP - `POST` /user/new-otp
 * 5. VerifyEmail - `POST` /user/verify-email
 * 6. VerifyOTP - `POST` /user/verify-email
 * 7. RequestForAuthorityUpgrade - `POST` /user
 * 8. RequestForForgotPassword - `POST` /user/forget-password
 * 9. RequestForResetPassword - `GET` /user/request-reset-password/:requestToken
 * 10. ResetPassword - `POST` /user/reset-password
 * 11. RequestForUseDetails - `GET` /user?name=true&email=true&id=true&created=true&phone=true
 */
@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*credentials: {\
	 * 		*`firstName`: string;\
     * 		*`lastName`: string;\
     * 		*`emailId`: string;\
	 * 		*`countryCode`: string\
     * 		*`phone`: string | number;\
     * 		*`password`: string;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
	@Post('new-user')
	@Header('X-Powered-By', 'Minitube')
	public async createAccount(@Body('credentials') credentials: {
		firstName: string,
		lastName?: string,
		emailId: string,
		countryCode: string,
		phone: string | number,
		password: string
	}) {
		return await this.usersService.createAccount(credentials);
	}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*credentials: {\
     * 		*`emailId`?: string;\
     * 		*`phone`?: string | number;\
     * 		*`password`: string;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
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

	/**
	 * Method: `GET`\
	 * request.body: {\
	 * 	*credentials: {\
     * 		*`emailId`: string;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
	@Post('new-email-token')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForNewEmailToken(@Body('credentials') credentials: { emailId: string }) {
		return await this.usersService.requestForNewEmailToken(credentials);
	}

	/**
	 * Method: `GET`\
	 * request.body: {\
	 * 	*credentials: {\
     * 		*`phone`: string | number;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
	@Post('new-otp')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForNewOTP(@Body('credentials') credentials: { countryCode: string, phone: string | number }) {
		return await this.usersService.requestForNewOTP(credentials);
	}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*credentials: {\
     * 		*`emailId`: string;\
	 * 		*`verificationToken`: string;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
	@Get('verify-email')
	@Header('X-Powered-By', 'MiniTube')
	public async VerifyEmail(@Query('email') emailId: string, @Query('token') verificationToken: string ) {
		return await this.usersService.verifyEmail(emailId, verificationToken);
	}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*credentials: {\
     * 		*`phone`: string | number;\
	 * 		*`OTP`: number;\
	 * 	}\
	 * }
	 * @param credentials all the fields are necessary
	 */
	@Post('verify-otp')
	@Header('X-Powered-By', 'MiniTube')
	public async VerifyOTP(@Body('credentials') credentials: { phone: string | number, OTP: number }) {
		return await this.usersService.verifyOTP(credentials);
	}

	/**
	 * Method: `GET`\
	 * request.header: { Authorization: string; }\
	 * @param request
	 * @query id value `true` to be passed if required
	 * @query name value `true` to be passed if required
	 * @query email value `true` to be passed if required
	 * @query phone value `true` to be passed if required
	 * @query created value `true` to be passed if required
	 * ex: GET http://localhost/user?name=true&phone=true
	 */
	@Get('')
	@Header('X-Powered-By', 'MiniTube')
	public async GetUserDetails(
		@Req() request: Request, 
		@Query('id') id?: string,
		@Query('name') name?: string,
		@Query('email') email?: string,
		@Query('phone') phone?: string,
		@Query('created') createdAt?: string,
	) {
		return await this.usersService.getUserDetails(request, { id, name, email, phone, createdAt });
	}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*requestedAuthority: 'super' | 'administrator' | 'mid-tier'\
	 * }\
	 * @param requestedAuthority restricted values are\
	 * `super`  `administrator`  `mid-tier`
	 */
	@Post('')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForAuthorityUpgrade(@Req() request: Request, @Body('requestedAuthority') requestedAuthority: string) {
		return await this.usersService.RequestForAuthorityUpgrade(request, requestedAuthority)
	}

	/**
	 * Method: `POST`\
	 * request.body: {\
	 * 	*credentials: { emailId: string }\
	 * }\
	 * @param credentials fields are required\
	 */
	@Post('forget-password')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestForForgotPassword(@Body('credentials') credentials: { emailId: string }) {
		return await this.usersService.RequestForForgotPassword(credentials);
	}

	/**
	 * Method: `GET`\
	 * Params: requestToken: string
	 * @param requestToken parameter is required\
	 */
	@Get('request-reset-password/:requestToken')
	@Header('X-Powered-By', 'MiniTube')
	public async RequestResetPassword(@Param('requestToken') requestToken: string) {
		return await this.usersService.RequestResetPassword(requestToken);
	}

	/**
	 * Method: `POST`\
	 * req.body: {\
	 * 	data: { password: string }\
	 * }\
	 * @param resId query is required\
	 */
	@Post('reset-password')
	@Header('X-Powered-By', 'MiniTube')
	public async ResetPassword(@Query('resId') resId: string, @Body('data') data: { password: string }) {
		return await this.usersService.ResetPassword(resId, data);
	}

	@Put('profile-image')
	@Header('X-Powered-By', 'MiniTube')
	@UseInterceptors(FileInterceptor('file'))
	public async UpdateImage(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
		return ({ statusCode: 201 });
	}
}
