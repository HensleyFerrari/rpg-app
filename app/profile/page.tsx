import { getCurrentUser } from "@/lib/actions/user.actions";
import { getMyCampaigns } from "@/lib/actions/campaign.actions";
import { getCharactersByOwner } from "@/lib/actions/character.actions";
import { ProfileHeader } from "./components/ProfileHeader";
import { StatsCards } from "./components/StatsCards";
import { CampaignList } from "./components/CampaignList";
import { CharacterList } from "./components/CharacterList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const campaignsData = await getMyCampaigns();
  const charactersData = await getCharactersByOwner();

  const campaigns = campaignsData.ok ? (campaignsData.data as any[]) || [] : [];
  const characters = charactersData.ok ? (charactersData.data as any[]) || [] : [];

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-5xl px-4">
      <ProfileHeader user={user} />

      <StatsCards
        totalCampaigns={campaigns.length}
        totalCharacters={characters.length}
      />

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Minhas Campanhas ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="characters">Meus Personagens ({characters.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-6">
          <CampaignList campaigns={campaigns} />
        </TabsContent>
        <TabsContent value="characters" className="mt-6">
          <CharacterList characters={characters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
