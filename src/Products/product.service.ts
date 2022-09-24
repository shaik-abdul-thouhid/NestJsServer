import { Injectable } from '@nestjs/common';
import { InjectModel, } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product } from './product.model';

@Injectable()
export class ProductsService {

    constructor(@InjectModel('Product') private readonly productModel: Model<Product> = new Model<Product>()) {}

    async insertProduct(title: string, description: string, price: number) {
        const newProduct = new this.productModel({ title, description, price });
        const result = await newProduct.save();
        return result.id as string;
    }

    async getProducts() {
        const products = await this.productModel.find().exec();
        return products.map(product => ({
            id: product._id,
            title: product.title,
            description: product.description,
            price: product.price
        }));
    }
}