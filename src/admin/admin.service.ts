import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../Users/users.service';

@Injectable()
export class AdminService {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UsersService
	) {}
}