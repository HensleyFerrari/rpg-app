import type { Metadata } from "next";
import React from "react";
import { GlobalModals } from "./_components/global-modals";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
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
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <DashboardBreadcrumb />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-8">
        <React.Suspense fallback={null}>
          <GlobalModals />
        </React.Suspense>
        {children}
      </div>
      <FloatingMenu />
    </div>
  );
}
