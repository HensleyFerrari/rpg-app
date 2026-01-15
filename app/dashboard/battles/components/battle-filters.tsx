"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BattleFilters = ({ campaigns }: { campaigns: any[] }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  const currentFilter = searchParams.get("filter") || "all";
  const currentCampaign = searchParams.get("campaign") || "all";

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([name, value]) => {
        if (value) {
          newParams.set(name, value);
        } else {
          newParams.delete(name);
        }
      });
      
      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    // Only update if the search term actually changed and is different from URL
    const currentQ = searchParams.get("q") || "";
    if (debouncedSearch !== currentQ) {
      router.push(`${pathname}?${createQueryString({ q: debouncedSearch })}`);
    }
  }, [debouncedSearch, pathname, router, createQueryString, searchParams]);

  const handleFilterChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ filter: value })}`);
  };

  const handleCampaignChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ campaign: value === "all" ? null : value })}`);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar batalhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           {/* Campaign Select */}
           <Select value={currentCampaign} onValueChange={handleCampaignChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por Campanha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Campanhas</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Scope Tabs */}
          <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="my">Minhas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

      </div>
    </div>
  );
};
