export const dynamic = "force-dynamic";
import { authController } from "@/backend/modules/auth/auth.controller";
import { withAuth } from "@/backend/middleware/auth.middleware";
 
export const GET = withAuth(authController.me);