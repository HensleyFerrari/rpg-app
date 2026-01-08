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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
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
  Cog,
  Sparkles,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icons: LayoutDashboard,
  },
  {
    title: "Campanhas",
    icons: Crown,
    id: "campaigns",
    items: [
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
    id: "characters",
    items: [
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
    ],
  },
  {
    title: "Batalhas",
    icons: Swords,
    id: "battles",
    items: [
      {
        title: "Minhas Batalhas",
        url: "/dashboard/battles/mybattles",
        icons: Skull,
      },
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
  {
    title: `Configurações`,
    url: "/dashboard/settings",
    icons: Cog,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [actualUser, setActualUser] = useState<{
    name?: string;
    avatarUrl?: string;
  }>({});

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const getUser = await getCurrentUser();
      if (getUser) {
        setActualUser(getUser);
      }
    };

    // Load persisted group states
    const saved = localStorage.getItem("sidebar_groups");
    if (saved) {
      try {
        setOpenGroups(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sidebar_groups", e);
      }
    } else {
      // Default all to open on first load
      const defaults: Record<string, boolean> = {};
      items.forEach(item => {
        if (item.id) defaults[item.id] = true;
      });
      setOpenGroups(defaults);
    }

    fetchData();
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      localStorage.setItem("sidebar_groups", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-background/60 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2 overflow-hidden">
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight">
              Dr.PG
              <span className="ml-1 text-xs font-medium text-blue-500/80 uppercase tracking-widest">
                alpha
              </span>
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url || (item.items && item.items.some(sub => pathname === sub.url));
              
              if (!item.items) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        pathname === item.url && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                      )}
                    >
                      <a href={item.url}>
                        {item.icons && <item.icons className={cn("h-4 w-4", pathname === item.url && "text-blue-500")} />}
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={item.title}
                  open={openGroups[item.id!]}
                  onOpenChange={() => toggleGroup(item.id!)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200",
                          isActive && "text-blue-500 font-semibold"
                        )}
                      >
                        {item.icons && <item.icons className={cn("h-4 w-4", isActive && "text-blue-500")} />}
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-blue-500/20 ml-4 mt-1 border-l group-data-[collapsible=icon]:hidden">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild 
                              isActive={pathname === subItem.url}
                              className={cn(
                                "transition-all duration-200",
                                pathname === subItem.url && "text-blue-500 bg-blue-500/5"
                              )}
                            >
                              <a href={subItem.url} className="flex gap-2">
                                {subItem.icons && <subItem.icons className="h-3.5 w-3.5" />}
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 bg-white/5 p-4 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0 border border-blue-500/20 ring-2 ring-blue-500/10">
                <AvatarImage src={actualUser?.avatarUrl} />
                <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold truncate max-w-[120px]">
                  {actualUser?.name || "Usuário"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Mestre <Crown className="h-2 w-2 text-yellow-500" />
                </span>
              </div>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <ModeToggle />
            </div>
          </div>

          <div className="flex gap-2">
            <SidebarMenuButton
              tooltip="Sair"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
              onClick={() => {
                signOut({ redirect: false }).then(() => {
                  window.location.href = "/";
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
            <span>Feito com</span>
            <Heart className="h-3 w-3 text-red-500 animate-pulse" />
            <span>por Hens</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
