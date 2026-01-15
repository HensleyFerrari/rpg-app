"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, User, Users } from "lucide-react";

interface CharacterFiltersProps {
  campaigns: { _id: string; name: string }[];
}

export function CharacterFilters({ campaigns }: CharacterFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter");
  const currentCampaignId = searchParams.get("campaignId");

  // Determine the effective "mode"
  // If filter=mine -> "mine"
  // If campaignId exists -> "campaign"
  // Else -> "all"
  const mode = currentFilter === "mine" ? "mine" : currentCampaignId ? "campaign" : "all";

  const handleModeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("filter");
      params.delete("campaignId");
    } else if (value === "mine") {
      params.set("filter", "mine");
      params.delete("campaignId");
    } else if (value === "campaign") {
      // When switching to campaign mode, if we have campaigns, maybe select the first one or just enter the mode waiting for selection?
      // For now, let's just clear filter and wait for user to select campaign if they haven't.
      // Or if we don't have a campaignId yet, we don't set it.
      params.delete("filter");
      if (!currentCampaignId && campaigns.length > 0) {
         params.set("campaignId", campaigns[0]._id);
      }
    }
    
    router.push(`/dashboard/personagens?${params.toString()}`);
  };

  const handleCampaignChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("campaignId", value);
    params.delete("filter"); 
    router.push(`/dashboard/personagens?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="space-y-2 min-w-[200px]">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Filter className="w-3 h-3" /> Filtrar por
        </Label>
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Todos os Personagens</span>
              </div>
            </SelectItem>
            <SelectItem value="mine">
               <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Meus Personagens</span>
              </div>
            </SelectItem>
            <SelectItem value="campaign">Por Campanha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "campaign" && (
        <div className="space-y-2 min-w-[200px] animate-in fade-in slide-in-from-left-4 duration-300">
          <Label className="text-xs font-medium text-muted-foreground">Campanha</Label>
          <Select 
            value={currentCampaignId || ""} 
            onValueChange={handleCampaignChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a campanha" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((camp) => (
                <SelectItem key={camp._id} value={camp._id}>
                  {camp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
