import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

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
    <SidebarProvider>
      <AppSidebar />
      <main className="w-screen overflow-auto">
        <SidebarTrigger />
        <div className="p-8 ">{children}</div>
      </main>
    </SidebarProvider>
  );
}
