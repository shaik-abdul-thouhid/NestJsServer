import { Module } from '@nestjs/common';
import { AuthModule, AuthService } from 'src/auth/auth.exports';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [ AuthModule ],
	providers: [ AuthService, UsersService ],
	controllers: [ UsersController ],
	exports: [ UsersService ]
})
export class UsersModule {}