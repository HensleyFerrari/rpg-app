"use client";
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
import {
  ChevronDown,
  Book,
  Heart,
  LayoutDashboard,
  User,
  Home,
  Users,
  Bookmark,
  BookOpen,
  PlusCircle,
  List,
  Settings,
  LogOut,
} from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/user.actions";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icons: LayoutDashboard,
  },
  {
    title: "Campanhas",
    icons: BookOpen,
    itens: [
      // {
      //   title: "Minhas Campanhas",
      //   url: "/dashboard/campaigns/mycampaigns",
      //   icons: Bookmark,
      // },
      {
        title: "Campanhas Criadas",
        url: "/dashboard/campaigns/mycampaigns",
        icons: PlusCircle,
      },
      {
        title: "Todas as campanhas",
        url: "/dashboard/campaigns",
        icons: List,
      },
    ],
  },
  {
    title: "Personagens",
    icons: Users,
    itens: [
      {
        title: "Meus Personagens",
        url: "/dashboard/personagens/mycharacters",
        icons: User,
      },
      {
        title: "Todos os Personagens",
        url: "/dashboard/personagens",
        icons: Users,
      },
      {
        title: "Criar Personagem",
        url: "/dashboard/personagens/new",
        icons: PlusCircle,
      },
    ],
  },
  {
    title: "Batalhas",
    icons: Book,
    itens: [
      {
        title: "Minhas Batalhas",
        url: "/dashboard/battles/mybattles",
        icons: BookOpen,
      },
      {
        title: "Criar Batalha",
        url: "/dashboard/battles/newBattle",
        icons: BookOpen,
      },
      {
        title: "Todas as Batalhas",
        url: "/dashboard/battles",
        icons: List,
      },
    ],
  },
  // {
  //   title: "Configurações",
  //   url: "/dashboard/settings",
  //   icons: Settings,
  // },
  // {
  //   title: "Home",
  //   url: "/",
  //   icons: Home,
  // },
];

export function AppSidebar() {
  const [actualUser, setActualUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const getUser = await getCurrentUser();
      setActualUser(getUser);
    };

    fetchData();
  }, []);

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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={() => {
                    signOut({ redirect: false }).then(() => {
                      window.location.href = "/";
                    });
                  }}
                >
                  <a href="#">
                    <LogOut />
                    <span>Logout</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="font-semibold">
        <span className="flex gap-2">
          <User className="w-6 h-6" /> {actualUser.name}
        </span>
        <Heart />
      </SidebarFooter>
    </Sidebar>
  );
}
