import { productRepository } from "./product.repository";

type ProductCreateBody = { name: string; price: number; stock: number; description?: string };
type ProductUpdateBody = Partial<ProductCreateBody>;

export const productService = {
  getAll: (userId: string) => productRepository.findAll(userId),

  getById: async (id: string, userId: string) => {
    const product = await productRepository.findById(id, userId);
    if (!product) throw new Error("Product not found");
    return product;
  },

  create: (body: ProductCreateBody, userId: string) =>
    productRepository.create({ ...body, userId }),

  update: async (id: string, body: ProductUpdateBody, userId: string) => {
    await productService.getById(id, userId); // pastikan punya akses
    return productRepository.update(id, body);
  },

  delete: async (id: string, userId: string) => {
    await productService.getById(id, userId);
    return productRepository.delete(id);
  },
};