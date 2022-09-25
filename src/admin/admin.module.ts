import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../Users/users.service';
import { UsersModule } from '../Users/users.module';


@Module({
	imports: [ AuthModule, UsersModule ],
	providers: [ AdminService, AuthService, UsersService ],
	controllers: [ AdminController ],
})
export class AdminModule {}