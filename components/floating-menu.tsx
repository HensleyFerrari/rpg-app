"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme-toggle";
import {
  AlignJustify,
  Cog,
  Crown,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Swords,
  User,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { signOut } from "next-auth/react";
import Link from "next/link";

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
];

export function FloatingMenu() {
  const pathname = usePathname();
  const [actualUser, setActualUser] = useState<{
    name?: string;
    avatarUrl?: string;
  }>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const getUser = await getCurrentUser();
      if (getUser) {
        setActualUser(getUser);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 md:bottom-8 md:right-8">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg shadow-primary/50 transition-all hover:scale-110 hover:shadow-primary/70 bg-primary text-primary-foreground hover:opacity-90"
          >
            <AlignJustify className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="end" 
          sideOffset={16}
          className="w-72 rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl p-4 shadow-2xl shadow-black/40 xl:w-80"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center px-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight">Dr.PG</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    BETA
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">O seu sistema de RPG</span>
              </div>
            </div>

            <div className="my-2 h-px bg-white/5" />

            <nav className="flex flex-col gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url;
                
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icons className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="my-2 h-px bg-white/5" />

            {/* Footer / User Area */}
            <div className="flex flex-col gap-3">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <UserCircle className="h-4 w-4 transition-transform group-hover:scale-110 text-muted-foreground group-hover:text-foreground" />
                  Perfil
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <Cog className="h-4 w-4 transition-transform group-hover:scale-110 text-muted-foreground group-hover:text-foreground" />
                  Configurações
                </Link>
                <button
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => {
                    signOut({ redirect: false }).then(() => {
                      window.location.href = "/";
                    });
                  }}
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Sair
                </button>
              </nav>

              <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                    <AvatarImage src={actualUser?.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate flex-1 block">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {actualUser?.name || "Usuário"}
                    </span>
                  </div>
                </div>
                <ModeToggle />
              </div>
            </div>
            
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
