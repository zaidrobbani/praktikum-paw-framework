"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/frontend/stores/authStore";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // AuthHydrator will populate user (or keep it null) via /auth/me.
    if (user) router.replace("/products");
    else router.replace("/login");
  }, [router, user]);

  return null;
}
