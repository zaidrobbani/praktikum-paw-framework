import { authController } from "@/backend/modules/auth/auth.controller";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return authController.register(req);
}
