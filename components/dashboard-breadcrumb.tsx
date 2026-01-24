"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useMemo } from "react";

const routeMapping: Record<string, string> = {
  dashboard: "Dashboard",
  personagens: "Personagens",
  campaigns: "Campanhas",
  battles: "Batalhas",
  npcs: "NPCs",
  mycharacters: "Meus Personagens",
  create: "Criar",
  edit: "Editar",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  const items = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    // Build crumbs
    const crumbs = segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;

      // Check if it's a known static route
      let label = routeMapping[segment];

      // If not known, check if it looks like an ID (MongoDB ObjectId is 24 hex chars)
      if (!label) {
        if (/^[0-9a-fA-F]{24}$/.test(segment)) {
          label = "Detalhes";
        } else {
          // Fallback: capitalize first letter
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
      }

      return {
        label,
        href,
      };
    });

    return crumbs;
  }, [pathname]);

  // If we are just at /dashboard, maybe show nothing or just "Dashboard" (but generic Breadcrumb might handle it)
  // The existing Breadcrumb component shows a back button by default.
  // We might want to disable the back button on the root dashboard page?
  const showBackButton = pathname !== "/dashboard";

  return <Breadcrumb items={items} showBackButton={showBackButton} className="mb-0" />;
}
