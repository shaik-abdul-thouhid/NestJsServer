import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { ProductSchema } from './product.model';

import { UsersModule } from './users/users.module';

@Module({
    imports: [ UsersModule, MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]) ],
    controllers: [ ProductsController ],
    providers: [ ProductsService ],
})
export class ProductsModule {
    constructor() {
        console.log(UsersModule);
    }
}