import { Injectable } from '@nestjs/common';
import { UsersService } from '../Users/users.service';

@Injectable()
export class ChannelService {
	constructor(private readonly userService: UsersService) {}
}