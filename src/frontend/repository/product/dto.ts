export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export type AllProducts = Product[];

export type CreateProductRequest = {
    name: string;
    description: string;
    price: number;
    stock: number;
}

export type UpdateProductRequest = {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
}

