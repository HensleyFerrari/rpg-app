"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Book, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CharacterStatusBadge } from "@/components/ui/character-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Character {
  _id: string;
  name: string;
  owner: string | { _id: string; name: string; username: string };
  campaign: {
    _id: string;
    name: string;
  };
  characterUrl: string;
  status: string;
  isNpc?: boolean;
}

interface CharacterListViewProps {
  characters: Character[];
  showOwner?: boolean;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

export function CharacterListView({
  characters,
  showOwner = true,
  onDelete,
  currentUserId
}: CharacterListViewProps) {
  const searchParams = useSearchParams();
  const isOwner = (char: Character) => {

    if (!currentUserId) return false;
    const ownerId = typeof char.owner === 'object' ? char.owner._id : char.owner;
    return ownerId === currentUserId;
  };
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Avatar</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Status</TableHead>
            {showOwner && <TableHead>Criador</TableHead>}
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showOwner ? 6 : 5} className="h-24 text-center">
                Nenhum personagem encontrado.
              </TableCell>
            </TableRow>
          ) : (
            characters.map((char) => (
              <TableRow key={char._id} className="group">
                <TableCell>
                  <CharacterAvatarWrapper char={char} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/personagens/${char._id}`}
                      className="hover:underline"
                    >
                      {char.name}
                    </Link>
                    {char.isNpc && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">NPC</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Book className="w-3 h-3 text-muted-foreground" />
                    <span className="line-clamp-1">{char.campaign.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <CharacterStatusBadge status={char.status as "alive" | "dead"} />
                </TableCell>
                {showOwner && (
                  <TableCell className="text-sm text-muted-foreground">
                    {typeof char.owner === 'object'
                      ? char.owner.name || char.owner.username
                      : char.owner}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/personagens/${char._id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" /> Visualizar
                        </Link>
                      </DropdownMenuItem>
                      {isOwner(char) && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={{
                                pathname: "/dashboard/personagens",
                                query: { ...Object.fromEntries(searchParams.entries()), edit: char._id },
                              }}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          </DropdownMenuItem>
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(char._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div >
  );
}

function CharacterAvatarWrapper({ char }: { char: Character }) {
  return (
    <CharacterAvatar
      src={char.characterUrl}
      alt={char.name}
      isNpc={char.isNpc}
      size={40}
    />
  );
}
