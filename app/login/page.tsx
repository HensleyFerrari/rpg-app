"use client";

import { LoginForm } from "@/components/login-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    return router.push("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
