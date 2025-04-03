# RPG App

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Battle Actions API

This module provides server actions for managing battles in the RPG application.

### Functions

#### `createBattle`

Creates a new battle.

**Parameters:**

- `BattleParams`: Battle document parameters

**Returns:**

- Success: `{ ok: true, message: "Batalha criada com sucesso", data: [battle object] }`
- Error: `{ ok: false, message: "Erro ao criar batalha" }`

#### `getBattleById`

Retrieves a battle by its ID.

**Parameters:**

- `id`: String representing the battle ID

**Returns:**

- Success: `{ ok: true, data: [battle object with populated characters] }`
- Error: `{ ok: false, message: [error message] }`

#### `getBattlesByCampaign`

Retrieves all battles for a specific campaign.

**Parameters:**

- `campaignId`: String representing the campaign ID

**Returns:**

- Success: `{ ok: true, data: [array of battle objects with populated characters] }`
- Error: `{ ok: false, message: [error message] }`

#### `updateBattle`

Updates an existing battle.

**Parameters:**

- `id`: String representing the battle ID
- `battleParams`: Partial battle document with fields to update

**Returns:**

- Success: `{ ok: true, data: [updated battle object] }`
- Error: `{ ok: false, message: [error message] }`

#### `deleteBattle`

Deletes a battle and removes all references to it.

**Parameters:**

- `id`: String representing the battle ID

**Returns:**

- Success: `{ ok: true, message: "Batalha deletada com sucesso" }`
- Error: `{ ok: false, message: [error message] }`

## Models

The application uses the following models:

- Battle: Represents a battle with characters
- User: Represents a user in the system
- Campaign: Represents a campaign with battles and other elements

## Database

The application uses MongoDB, connected through Mongoose.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
