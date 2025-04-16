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
  Users,
  List,
  LogOut,
  Swords,
  ScrollText,
  Crown,
  UsersRound,
  Skull,
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
    icons: Crown,
    itens: [
      {
        title: "Minhas Campanhas",
        url: "/dashboard/campaigns/mycampaigns",
        icons: ScrollText,
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
    icons: UsersRound,
    itens: [
      {
        title: "Meus Personagens",
        url: "/dashboard/personagens/mycharacters",
        icons: User,
      },
      // {
      //   title: "Criar Personagem",
      //   url: "/dashboard/personagens/new",
      //   icons: UserPlus,
      // },
      {
        title: "Todos os Personagens",
        url: "/dashboard/personagens",
        icons: Users,
      },
    ],
  },
  {
    title: "Batalhas",
    icons: Swords,
    itens: [
      {
        title: "Minhas Batalhas",
        url: "/dashboard/battles/mybattles",
        icons: Skull,
      },
      // {
      //   title: "Criar Batalha",
      //   url: "/dashboard/battles/newBattle",
      //   icons: ShieldPlus,
      // },
      {
        title: "Todas as Batalhas",
        url: "/dashboard/battles",
        icons: List,
      },
    ],
  },
  {
    title: "Feedbacks",
    url: "/dashboard/feedback",
    icons: ScrollText,
  },
];

export function AppSidebar() {
  const [actualUser, setActualUser] = useState({
    name: "",
  });

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
            <span className="self-center">
              Dr.PG{" "}
              <span className="text-blue-500 dark:text-blue-300">alpha</span>
            </span>{" "}
            <ModeToggle />
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
          <User className="w-6 h-6" /> {actualUser?.name}
        </span>
        <span className="flex gap-2 text-xs">
          <Heart className="text-red-600 w-3 h-3 self-center" /> Hens
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
