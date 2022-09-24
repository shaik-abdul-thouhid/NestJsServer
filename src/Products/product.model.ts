import { Schema } from 'mongoose';

export const ProductSchema = new Schema({
    title: { type: String, required: true },
    description: { type:String, required: true },
    price: { type: Number, required: true }
});

export interface Product {
    id: string;  
    title: string;
    description: string;
    price: number
}
