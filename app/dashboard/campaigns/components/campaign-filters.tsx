"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";

export const CampaignFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebounce(search, 500);
  
  const currentFilter = searchParams.get("filter") || "all";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.push(`${pathname}?${createQueryString("q", debouncedSearch)}`);
  }, [debouncedSearch, pathname, router, createQueryString]);

  const handleFilterChange = (value: string) => {
     router.push(`${pathname}?${createQueryString("filter", value)}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campanhas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-full md:w-auto">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="my">Minhas</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
