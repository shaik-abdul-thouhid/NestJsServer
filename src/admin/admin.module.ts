import { Module } from '@nestjs/common';
import { AuthModule, AuthService } from '../auth/auth.exports';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule, UsersService } from '../Users/users.exports';


@Module({
	imports: [ AuthModule, UsersModule ],
	providers: [ AdminService, AuthService, UsersService ],
	controllers: [ AdminController ],
})
export class AdminModule {}