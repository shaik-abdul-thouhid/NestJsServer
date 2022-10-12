import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
	constructor(private readonly http: HttpService) {}
}