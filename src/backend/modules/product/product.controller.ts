import { NextRequest, NextResponse } from "next/server";
import { productService } from "./product.service";

export const productController = {
  getAll: async (req: NextRequest) => {
    const userId = req.headers.get("x-user-id")!;
    const products = await productService.getAll(userId);
    return NextResponse.json(products);
  },

  getById: async (req: NextRequest, id: string) => {
    const userId = req.headers.get("x-user-id")!;
    const product = await productService.getById(id, userId);
    return NextResponse.json(product);
  },

  create: async (req: NextRequest) => {
    const userId = req.headers.get("x-user-id")!;
    const body = await req.json();
    const product = await productService.create(body, userId);
    return NextResponse.json(product, { status: 201 });
  },

  update: async (req: NextRequest, id: string) => {
    const userId = req.headers.get("x-user-id")!;
    const body = await req.json();
    const product = await productService.update(id, body, userId);
    return NextResponse.json(product);
  },

  delete: async (req: NextRequest, id: string) => {
    const userId = req.headers.get("x-user-id")!;
    await productService.delete(id, userId);
    return NextResponse.json({ message: "Deleted successfully" });
  },
};