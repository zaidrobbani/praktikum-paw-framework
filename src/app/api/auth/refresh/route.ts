export const dynamic = "force-dynamic";
import { authController } from "@/backend/modules/auth/auth.controller";
import { NextRequest } from "next/server";
 
export async function POST(req: NextRequest) {
  return authController.refresh(req);
}
