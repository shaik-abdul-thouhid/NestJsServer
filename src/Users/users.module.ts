import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [ AuthModule ],
	providers: [ AuthService, UsersService ],
	controllers: [ UsersController ],
	exports: [ UsersService ]
})
export class UsersModule {

}