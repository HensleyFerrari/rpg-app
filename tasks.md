# Roadmap e Tarefas - RPG App

Este documento centraliza ideias de funcionalidades, melhorias de interface, refatorações e débitos técnicos para o futuro do projeto.

## 🚀 Novas Funcionalidades (Features)

### Batalhas e Combate
- [ ] **Rastreador de Iniciativa**: Implementar sistema visual para ordenar turnos de personagens e monstros durante a batalha.
- [ ] **Rolagem de Dados 3D**: Adicionar visualizador de dados 3D ou logs de rolagem com fórmulas complexas (ex: `2d20 + 5`).
- [ ] **Grid de Batalha**: Integração de mapas simples (imagens) com tokens de personagens arrastáveis (Drag & Drop) para posicionamento.
- [ ] **Condições e Efeitos**: Sistema para aplicar status (Veneno, Atordoado, etc.) que persistem por turnos ou tempo.

### Social e Tempo Real
- [ ] **Chat da Campanha**: Sala de chat persistente por campanha usando Pusher para comunicação entre jogadores e mestre.
- [ ] **Log de Eventos**: Feed de atividades (rolagens de dados, danos aplicados, upgrades de nível) em tempo real durante a sessão.
- [ ] **Modo Espectador**: Link público (somente leitura) para não-jogadores assistirem o status da batalha em tempo real.

### Gestão de Personagens
- [ ] **Fichas Customizáveis**: Permitir criação de campos dinâmicos na ficha do personagem para suportar diferentes sistemas de RPG.
- [ ] **Inventário**: Sistema de gerenciamento de itens com peso, quantidade e descrições.
- [ ] **Exportação PDF**: Funcionalidade para gerar ficha do personagem em PDF estilizado para impressão.
- [ ] **Notas Pessoais**: Área para jogadores e mestres tomarem notas privadas sobre a campanha.

## 🎨 UI/UX (Interface e Experiência)

### Visual
- [ ] **Modo Zen**: Opção para recolher a sidebar durante as sessões de jogo, maximizando a área útil da mesa.
- [ ] **Temas por Campanha**: Permitir que o mestre escolha uma cor de destaque diferente para cada campanha (além do Roxo padrão).
- [ ] **Micro-interações**: Adicionar animações sutis com Framer Motion ao causar dano, curar ou alterar HP.

### Acessibilidade e Usabilidade
- [ ] **Atalhos de Teclado**: Navegação rápida (ex: `CTRL+K` para buscar comandos, `B` para ir a batalhas).
- [ ] **Feedback Visual**: Implementar Toasts (via Sonner/Toast) para todas as ações de criação, edição e exclusão (CRUD).
- [ ] **Onboarding**: Tutorial guiado (tour) para novos usuários criarem sua primeira campanha e personagem.
- [ ] **Mobile Experience**: Otimizar a visualização das tabelas e do tracker de combate para telas pequenas.

## 🏗️ Arquitetura e Backend

### Performance
- [ ] **Otimização de Imagens**: Garantir uso correto do `next/image` com placeholders (blur) para avatares de personagens e mapas.
- [ ] **Parallel Data Fetching**: Auditar todas as páginas do dashboard para garantir uso de `Promise.all` em buscas de dados independentes.
- [ ] **Cache Strategy**: Implementar cache mais agressivo (React Cache ou Redis) para dados estáticos de regras/sistemas que mudam pouco.
- [ ] **Serialização Eficiente**: Otimizar serialização de objetos Mongoose, preferindo processamento em lote para listas grandes.

### Segurança e Infra
- [ ] **Rate Limiting**: Proteger rotas de API e Server Actions contra abuso.
- [ ] **Validação de Inputs**: Reforçar validação Zod no server-side para todas as Actions, garantindo consistência.
- [ ] **Logs e Monitoramento**: Integrar ferramenta de observabilidade (como Sentry) para rastrear erros em produção.

## 🔧 Refatoração e Qualidade de Código

### Testes
- [ ] **Cobertura E2E**: Expandir testes Playwright para cobrir fluxos críticos de combate e movimentação de tokens.
- [ ] **Testes Unitários**: Aumentar cobertura de testes unitários para Helpers de cálculo de dano e lógica de regras.
- [ ] **Mocking Padronizado**: Centralizar mocks para chamadas de banco de dados e autenticação nos testes.

### Código
- [ ] **Padronização de Forms**: Criar abstração reutilizável para formulários `react-hook-form` + `zod` para reduzir repetição de código (boilerplate).
- [ ] **Tipagem Estrita**: Centralizar definições de tipos (TypeScript) em `types/` e eliminar uso de `any` ou `ts-ignore`.
- [ ] **Clean Code**: Revisar arquivos muito grandes (God Components) e extrair sub-componentes menores e focados.
