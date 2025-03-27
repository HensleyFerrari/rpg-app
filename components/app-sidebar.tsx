import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown, Book, Heart, LayoutDashboard, User } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icons: LayoutDashboard,
  },
  {
    title: "Campanhas",
    icons: Book,
    itens: [
      {
        title: "Minhas Campanhas",
        url: "/dashboard/campaigns",
        icons: Book,
      },
      {
        title: "Campanhas Criadas",
        url: "/dashboard/campaigns/mycampaigns",
        icons: Book,
      },
      {
        title: "Todas as campanhas",
        url: "/dashboard/campaigns",
        icons: Book,
      },
    ],
  },
  {
    title: "Personagens",
    itens: [
      {
        title: "Meus Personagens",
        url: "#",
        icons: User,
      },
      {
        title: "Todos os Personagens",
        url: "#",
        icons: User,
      },
    ],
  },
  {
    title: "Home",
    url: "/",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between mb-5">
            <span className="self-center">Battle RPG</span> <ModeToggle />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (!item.itens) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          {item.icons && <item.icons />}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                } else {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarGroup>
                        <SidebarGroupLabel asChild>
                          <CollapsibleTrigger>
                            {item.title}
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              {item.itens.map((item) => {
                                return (
                                  <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                      <a href={item.url} className="flex gap-1">
                                        {item.icons && <item.icons />}
                                        <span className="self-center">
                                          {item.title}
                                        </span>
                                      </a>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                              })}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </SidebarGroup>
                    </Collapsible>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="font-semibold flex">
        <span>Desenvolvido por Hensley</span>
        <Heart />
      </SidebarFooter>
    </Sidebar>
  );
}
