import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.exports';
import { UsersService } from '../Users/users.exports';

@Injectable()
export class AdminService {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UsersService
	) {}
}