// Esta é uma função de exemplo - substitua pela conexão real ao seu banco de dados
// (ex: Prisma, MongoDB, etc.)

type Personagem = {
  id: string;
  nome: string;
  classe: string;
  nivel: number;
  raca: string;
  imageUrl?: string;
};

// Dados de exemplo - substitua pela busca real no banco de dados
const personagensExemplo: Personagem[] = [
  {
    id: "1",
    nome: "Aragorn",
    classe: "Guerreiro",
    nivel: 8,
    raca: "Humano",
    imageUrl: "/img/personagens/aragorn.jpg",
  },
  {
    id: "2",
    nome: "Gandalf",
    classe: "Mago",
    nivel: 15,
    raca: "Humano",
    imageUrl: "/img/personagens/gandalf.jpg",
  },
  {
    id: "3",
    nome: "Legolas",
    classe: "Arqueiro",
    nivel: 7,
    raca: "Elfo",
    imageUrl: "/img/personagens/legolas.jpg",
  },
];

export async function getPersonagens(): Promise<Personagem[]> {
  // Simulando o tempo de resposta de um banco de dados
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Retorna os dados de exemplo
  // Substitua por uma consulta real ao seu banco de dados
  return personagensExemplo;
}

export async function getPersonagemById(
  id: string
): Promise<Personagem | null> {
  // Simulando o tempo de resposta de um banco de dados
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Retorna o personagem com o ID correspondente
  const personagem = personagensExemplo.find((p) => p.id === id);
  return personagem || null;
}
