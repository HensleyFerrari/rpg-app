## 2024-05-18 - IDOR on NPC management
**Vulnerability:** Insecure Direct Object Reference (IDOR) on `updateNPC` and `deleteNPC` in `lib/actions/NPC.actions.ts`. Any authenticated user could update or delete any NPC, bypassing ownership and campaign master checks.
**Learning:** Server Actions must validate the ownership of resources directly, even when UI components restrict certain elements based on state, because they are direct API endpoints.
**Prevention:** Always verify resource ownership directly in the server actions using methods like `checkOwnership` and `verifyCampaignOwner` against the current authenticated user session before performing mutations.
