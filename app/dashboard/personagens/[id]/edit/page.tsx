"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCharacterById } from "@/lib/actions/character.actions";

const CharacterEdit = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        // Mock data for demonstration
        // In real app: const response = await fetch(`/api/characters/${id}`);
        // const data = await response.json();
        const { data: getCharacter } = await getCharacterById(id as string);

        setCharacter(getCharacter);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch character:", error);
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Editar Personagem</h1>
      <p>Detalhes do personagem aqui...</p>
      {/* Adicione o conteúdo da página de edição do personagem aqui */}
    </div>
  );
};

export default CharacterEdit;
