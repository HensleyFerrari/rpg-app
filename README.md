# RPG App

Um aplicativo web para gerenciar campanhas de RPG, personagens e batalhas.

## Funcionalidades

- **Gerenciamento de Campanhas**

  - Criar e gerenciar múltiplas campanhas
  - Adicionar descrições e imagens
  - Controle de estado ativo/inativo

- **Sistema de Personagens**

  - Criação de personagens com detalhes customizados
  - Vinculação a campanhas específicas
  - Status de vida/morte
  - Upload de imagens dos personagens

- **Sistema de Batalhas**

  - Criar encontros com múltiplos personagens
  - Sistema de rounds
  - Registro de dano
  - Acompanhamento de batalhas ativas

- **Feedback e Suporte**
  - Sistema integrado de feedback
  - Reporte de bugs
  - Sugestões de melhorias
  - Acompanhamento de status

## Requisitos

- Node.js 18.17 ou superior
- MongoDB
- NPM ou Yarn

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/rpg-app.git
cd rpg-app
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/mydb
NEXTAUTH_SECRET=seu_secret_para_autenticacao
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000).

## Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa a verificação de lint
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch

## API de Batalhas

### Funções

#### `createBattle`

Cria uma nova batalha.

**Parâmetros:**

- `BattleParams`: Parâmetros do documento da batalha

**Retornos:**

- Sucesso: `{ ok: true, message: "Batalha criada com sucesso", data: [objeto da batalha] }`
- Erro: `{ ok: false, message: "Erro ao criar batalha" }`

#### `getBattleById`

Recupera uma batalha pelo seu ID.

**Parâmetros:**

- `id`: String representando o ID da batalha

**Retornos:**

- Sucesso: `{ ok: true, data: [objeto da batalha com personagens populados] }`
- Erro: `{ ok: false, message: [mensagem de erro] }`

#### `getBattlesByCampaign`

Recupera todas as batalhas de uma campanha específica.

**Parâmetros:**

- `campaignId`: String representando o ID da campanha

**Retornos:**

- Sucesso: `{ ok: true, data: [array de objetos de batalha com personagens populados] }`
- Erro: `{ ok: false, message: [mensagem de erro] }`

#### `updateBattle`

Atualiza uma batalha existente.

**Parâmetros:**

- `id`: String representando o ID da batalha
- `battleParams`: Documento parcial da batalha com os campos a serem atualizados

**Retornos:**

- Sucesso: `{ ok: true, data: [objeto da batalha atualizado] }`
- Erro: `{ ok: false, message: [mensagem de erro] }`

#### `deleteBattle`

Deleta uma batalha e remove todas as referências a ela.

**Parâmetros:**

- `id`: String representando o ID da batalha

**Retornos:**

- Sucesso: `{ ok: true, message: "Batalha deletada com sucesso" }`
- Erro: `{ ok: false, message: [mensagem de erro] }`

## Banco de Dados

O aplicativo utiliza MongoDB como banco de dados principal, conectado através do Mongoose. A estrutura do banco inclui as seguintes coleções:

- **Users**: Armazena informações dos usuários
- **Campaigns**: Gerencia as campanhas de RPG
- **Characters**: Armazena os personagens
- **Battles**: Registra as batalhas
- **Damages**: Registra os danos causados nas batalhas
- **Feedbacks**: Armazena feedbacks dos usuários

## Tecnologias Utilizadas

- **Frontend**:

  - Next.js 15
  - React
  - Tailwind CSS
  - Shadcn/ui
  - TypeScript

- **Backend**:

  - Next.js API Routes
  - MongoDB
  - Mongoose
  - NextAuth.js

- **Ferramentas de Desenvolvimento**:
  - ESLint
  - Prettier
  - Jest
  - TypeScript

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
