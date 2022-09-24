import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService = new UsersService()) {}

    @Get('')
    getUsers() {
        return { user: this.userService.getUsers() };
    }
}
