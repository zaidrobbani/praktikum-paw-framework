export const dynamic = "force-dynamic";
import { productController } from "@/backend/modules/product/product.controller";
import { withAuth } from "@/backend/middleware/auth.middleware";
import { NextRequest } from "next/server";
type ProductRouteContext = { params: Promise<{ id: string }> };

export const GET = withAuth(async (req: NextRequest, context: ProductRouteContext) => {
  const { id } = await context.params;   // ← await di sini
  return productController.getById(req, id);
});
export const PUT = withAuth(async (req: NextRequest, context: ProductRouteContext) => {
  const { id } = await context.params;
  return productController.update(req, id);
});
export const DELETE = withAuth(async (req: NextRequest, context: ProductRouteContext) => {
  const { id } = await context.params;
  return productController.delete(req, id);
});