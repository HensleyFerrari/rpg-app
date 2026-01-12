"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
    url: "/dashboard/campaigns",
    icons: Crown,
    id: "campaigns",
  },
  {
    title: "Personagens",
    url: "/dashboard/personagens",
    icons: UsersRound,
  },
  {
    title: "Batalhas",
    url: "/dashboard/battles",
    icons: Swords,
    id: "battles",
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
  const { state } = useSidebar();
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
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-background/60 backdrop-blur-xl shrink-0">
      <SidebarHeader className={cn(
        "transition-all duration-200",
        state === "collapsed" ? "p-2" : "p-4"
      )}>
        <div className="flex items-center gap-2 px-2 overflow-hidden">
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight">
              Dr.PG
              <span className="ml-1 text-xs font-medium text-blue-500/80 uppercase tracking-widest">
                beta
              </span>
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(
        "transition-all duration-200",
        state === "collapsed" ? "px-1" : "px-2"
      )}>
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

              if (item.items && state === "collapsed") {
                return (
                  <SidebarMenuItem key={item.title}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={item.title}
                          className={cn(
                            "transition-all duration-200",
                            isActive && "text-blue-500 bg-blue-500/10"
                          )}
                        >
                          {item.icons && <item.icons className={cn("h-4 w-4", isActive && "text-blue-500")} />}
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-56 bg-background/95 backdrop-blur-xl border-white/10">
                        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 py-2">
                          {item.title}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <a 
                              href={subItem.url}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
                                pathname === subItem.url ? "text-blue-500 bg-blue-500/10" : "hover:bg-white/5"
                              )}
                            >
                              {subItem.icons && <subItem.icons className="h-4 w-4" />}
                              <span className="font-medium">{subItem.title}</span>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <SidebarFooter className={cn(
        "border-t border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-200",
        state === "collapsed" ? "p-2" : "p-4"
      )}>
        {state === "collapsed" ? (
          <div className="flex flex-col items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group relative outline-none">
                  <Avatar className="h-9 w-9 shrink-0 border border-blue-500/20 ring-2 ring-blue-500/10 transition-transform group-hover:scale-105">
                    <AvatarImage src={actualUser?.avatarUrl} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="flex flex-col gap-1 px-3 py-2">
                  <span className="text-sm font-semibold">{actualUser?.name || "Usuário"}</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Mestre <Crown className="h-2 w-2 text-yellow-500" />
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <Cog className="h-4 w-4" />
                    <span>Configurações</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between px-3 py-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4" />
                    <span>Tema</span>
                  </div>
                  <ModeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                  onSelect={() => {
                    signOut({ redirect: false }).then(() => {
                      window.location.href = "/";
                    });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-9 w-9 shrink-0 border border-blue-500/20 ring-2 ring-blue-500/10">
                  <AvatarImage src={actualUser?.avatarUrl} />
                  <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold truncate max-w-[120px]">
                    {actualUser?.name || "Usuário"}
                  </span>
                </div>
              </div>
              <ModeToggle />
            </div>

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
              <span className="font-medium">Sair</span>
            </SidebarMenuButton>

            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground/60">
              <span>Feito com</span>
              <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              <span>por Hens</span>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
