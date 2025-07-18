"use client"; //  ต้องเป็น Client Component

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function SessionChecker() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = !["/login", "/error"].includes(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && isProtectedRoute) {
      router.replace("/login");
    }
  }, [status, pathname, router]);

  return null;
}
