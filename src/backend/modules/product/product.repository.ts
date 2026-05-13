import {prisma} from "@/backend/config/prisma";

export const productRepository = {
  findAll: (userId: string) =>
    prisma.product.findMany({ where: { userId } }),

  findById: (id: string, userId: string) =>
    prisma.product.findFirst({ where: { id, userId } }),

  create: (data: { name: string; price: number; stock: number; description?: string; userId: string }) =>
    prisma.product.create({ data }),

  update: (id: string, data: Partial<{ name: string; price: number; stock: number; description: string }>) =>
    prisma.product.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.product.delete({ where: { id } }),
};