export const dynamic = "force-dynamic";
import { productController } from "@/backend/modules/product/product.controller";
import { withAuth } from "@/backend/middleware/auth.middleware";

export const GET = withAuth(productController.getAll);
export const POST = withAuth(productController.create);