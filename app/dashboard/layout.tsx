import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "Drgp - Dashboard",
  description: "Controle sua campanha de RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
