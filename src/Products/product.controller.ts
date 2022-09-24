import { Controller, Post, Get, Body } from '@nestjs/common';
import { ProductsService } from './product.service';

@Controller('products')
export class ProductsController {

    constructor(private readonly productService: ProductsService) {}

    @Post()
    async addProduct(
        @Body('title') prodTitle: string, 
        @Body('description') prodDescription: string,
        @Body('price') prodPrice: number
    ) {
        const genProductId = await this.productService.insertProduct(prodTitle, prodDescription, prodPrice);
        return { id: genProductId }
    }

    @Get()
    async getAllProducts() {
        const products = await this.productService.getProducts();
        return products;
    }
}
