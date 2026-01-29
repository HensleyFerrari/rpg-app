# System Design & Design System - RPG App

Este documento descreve a arquitetura do sistema e o Design System utilizado no projeto **RPG App**. O objetivo é garantir consistência visual, escalabilidade e manutenibilidade, seguindo as diretrizes de um design minimalista, moderno e focado na experiência do usuário.

## 1. Arquitetura do Sistema

### 1.1 Visão Geral
O projeto é construído como uma aplicação web moderna utilizando a stack React/Next.js. A arquitetura é baseada em componentes reutilizáveis e uma separação clara entre frontend e backend (via Next.js API Routes e Server Actions).

### 1.2 Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript.
- **Estilização**: Tailwind CSS.
- **Component Library**: Shadcn/ui.
- **Backend**: Next.js API Routes (Serverless) e Server Actions.
- **Banco de Dados**: MongoDB (com Mongoose ODM).
- **Autenticação**: NextAuth.js (Auth.js).
- **Gerenciamento de Estado**: React Hooks e Server Component State.

### 1.3 Fluxo de Dados
1.  **Client-Side**: O navegador renderiza componentes React. Interações disparam Server Actions ou chamadas API.
2.  **Server-Side**: Next.js processa as requisições.
3.  **Database**: Mongoose gerencia a comunicação e modelagem dos dados no MongoDB.
4.  **Auth**: NextAuth gerencia sessões e proteção de rotas.

## 2. Design System

### 2.1 Filosofia de Design
- **Minimalismo**: Interfaces limpas, redução de ruído visual, uso estratégico de espaço em branco (negative space).
- **Modernidade**: Estética atual, utilizando *glassmorphism* (vidro fosco), gradientes sutis e tipografia geométrica.
- **Identidade**: O **Roxo** é a cor primária, evocando mistério, magia e criatividade, alinhado ao tema de RPG.

### 2.2 Paleta de Cores

A paleta utiliza variáveis CSS (CSS Variables) configuradas no `app/globals.css` e integradas ao `tailwind.config.js`. O sistema é *Dark Mode First*.

#### Cores Primárias (Brand)
O Roxo é a cor de destaque, utilizada em botões principais, links ativos, e elementos de foco.

- **Primary**: Definido via OKLCH para maior gama de cores.
  - Variável: `--primary`
  - Referência Visual: Roxo Vibrante (~Hue 292).
  - Tailwind Classes: `bg-primary`, `text-primary`, `border-primary`.

#### Cores Neutras (Surface & Text)
Baseadas em **Slate/Stone** para oferecer um contraste suave sem a dureza do preto absoluto.

- **Background**:
  - Dark: Profundo, quase preto (Ex: `#020817` / `oklch(0.14 0.005 285)`).
  - Light: Branco / Off-white.
- **Foreground**: Texto principal com alto contraste.
- **Muted**: Para textos secundários e elementos de menor hierarquia.

#### Cores Semânticas
- **Destructive**: Vermelho para erros e ações de risco (deletar).
- **Secondary**: Para elementos de apoio, com menor peso visual que a cor primária.

### 2.3 Tipografia

A tipografia é fundamental para o minimalismo. Utilizamos a **Geist Sans**.

- **Família**: `Geist Sans` (`var(--font-geist)`).
- **Pesos**:
  - *Regular (400)*: Corpo de texto.
  - *Medium (500)*: Destaques sutis, botões.
  - *Bold (600/700)*: Títulos e Cabeçalhos.
- **Escala**: Segue o padrão do Tailwind (`text-sm`, `text-base`, `text-xl`, `text-4xl`, etc.).

### 2.4 Biblioteca de Componentes (Shadcn/ui)

Adotamos a **shadcn/ui** pela flexibilidade e acessibilidade. Os componentes residem em `components/ui` e são estilizados via Tailwind.

#### Diretrizes de Uso
- **Botões (`Button`)**:
  - *Primary*: `variant="default"` (Roxo Sólido).
  - *Secondary*: `variant="secondary"` ou `variant="outline"`.
  - *Ghost*: `variant="ghost"` para ações contextuais (ícones, links discretos).
- **Cards (`Card`)**:
  - Devem ser usados para agrupar conteúdo (Ex: Card de Personagem, Card de Campanha).
  - Em Dark Mode, preferência por bordas finas (`border-white/10`) e fundos translúcidos se sobrepostos a elementos gráficos.
- **Inputs e Formulários**:
  - Estilo limpo, com *focus ring* na cor primária.

### 2.5 Estilização e Efeitos Visuais

Para atingir o visual "Moderno":

- **Glassmorphism**: Uso de fundos translúcidos com desfoque para headers e overlays.
  - Classes: `bg-white/5 backdrop-blur-md border-white/10`.
- **Glows (Brilhos)**:
  - Uso de "blobs" ou gradientes radiais desfocados (`blur-3xl`) no fundo para dar vida à interface, utilizando a cor primária (roxo) e secundárias (azul/rosa).
- **Bordas Sutis**:
  - Bordas com baixa opacidade (`border-white/10`) para definir limites sem pesar o visual.
- **Animações**:
  - Micro-interações suaves.
  - `transition-all duration-300` para hovers.
  - Animações de entrada (`fade-in`, `slide-up`) para conteúdo principal.

### 2.6 Layout e Grid

- **Container**: Centralizado (`mx-auto`), com padding lateral padrão (`px-4`).
- **Responsividade**: Mobile-first. Grid system para telas maiores (`md:grid-cols-2`, `lg:grid-cols-3`).
- **Espaçamento**: Consistente, utilizando a escala do Tailwind (4, 8, 16, 24, 32, 48px...).

---

Este documento serve como a verdade única para decisões de design no **RPG App**.
