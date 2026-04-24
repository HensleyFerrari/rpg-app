import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/platform/user/user.actions";
import { redirect } from "next/navigation";
import { FloatingMenu } from "@/components/floating-menu";

export const metadata: Metadata = {
  title: "Drpg - Dashboard",
  description: "Controle sua campanha de RPG",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userAdmin = await getCurrentUser();
  if (userAdmin.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <>
      <main className="w-screen overflow-auto">
        <div className="p-8 ">{children}</div>
      </main>
      <FloatingMenu />
    </>
  );
}
