"use client";

import { useEffect, useState } from "react";
import { getCharactersByOwner, deleteCharacter } from "@/lib/actions/character.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Heart, AlertCircle, Users, VenetianMask, Skull, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterListView } from "@/components/CharacterListView";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MyCharacters = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [charResponse, user] = await Promise.all([
        getCharactersByOwner(),
        getCurrentUser()
      ]);

      if (charResponse.ok) {
        setCharacters((charResponse.data as any[]) || []);
      } else {
        setError(charResponse.message);
      }
      setCurrentUser(user);
    } catch (err) {
      setError("Falha ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este personagem?")) return;

    try {
      const response = await deleteCharacter(id);
      if (response.ok) {
        toast.success("Personagem excluído com sucesso");
        setCharacters(characters.filter(c => c._id !== id));
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err)
      toast.error("Erro ao excluir personagem");
    }
  };

  const isOwner = (char: any) => {
    if (!currentUser || !char) return false;
    const charOwnerId = typeof char.owner === 'object' ? char.owner._id : char.owner;
    return charOwnerId === currentUser._id;
  };

  const playerCharacters = characters.filter((char) => !char.isNpc);
  const npcCharacters = characters.filter((char) => char.isNpc);

  const renderCharacterSection = (list: any[], type: "pc" | "npc") => {
    const alive = list.filter((char) => char.status === "alive");
    const dead = list.filter((char) => char.status === "dead");

    if (list.length === 0) {
      return (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {type === "pc" ? (
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            ) : (
              <VenetianMask className="h-12 w-12 text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              {type === "pc" ? "Nenhum personagem encontrado" : "Nenhum NPC encontrado"}
            </h3>
            {type === "pc" && (
              <Link href="/dashboard/personagens/new" className="mt-4">
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Criar Meu Primeiro Personagem
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8 mt-6">
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground/90">Vivos</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{alive.length}</Badge>
          </div>
          <CharacterListView 
            characters={alive} 
            showOwner={false} 
            onDelete={handleDelete}
            isOwner={isOwner}
          />
        </div>

        {dead.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Skull className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground/90">Mortos</h2>
              <Badge variant="secondary" className="border-none">{dead.length}</Badge>
            </div>
            <CharacterListView 
              characters={dead} 
              showOwner={false} 
              onDelete={handleDelete}
              isOwner={isOwner}
            />
          </div>
        )}

        {type === "pc" && list.length > 0 && (
          <div className="flex justify-center mt-8">
            <Link href="/dashboard/personagens/new">
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Criar Novo Personagem
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando personagens...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Meus Personagens</h1>
          <p className="text-muted-foreground">Gerencie seus heróis e NPCs criados por você.</p>
        </div>
        <Link href="/dashboard/personagens/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" /> Novo Personagem
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-center py-10 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="font-semibold text-destructive">
            Erro ao carregar personagens: {error}
          </p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>Tentar novamente</Button>
        </div>
      ) : (
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="characters" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> Personagens
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <VenetianMask className="h-4 w-4" /> NPCs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters" className="focus-visible:outline-none focus-visible:ring-0">
            {renderCharacterSection(playerCharacters, "pc")}
          </TabsContent>
          
          <TabsContent value="npcs" className="focus-visible:outline-none focus-visible:ring-0">
            {renderCharacterSection(npcCharacters, "npc")}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MyCharacters;