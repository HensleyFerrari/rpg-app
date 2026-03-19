## 2024-05-18 - IDOR on NPC management
**Vulnerability:** Insecure Direct Object Reference (IDOR) on `updateNPC` and `deleteNPC` in `lib/actions/NPC.actions.ts`. Any authenticated user could update or delete any NPC, bypassing ownership and campaign master checks.
**Learning:** Server Actions must validate the ownership of resources directly, even when UI components restrict certain elements based on state, because they are direct API endpoints.
**Prevention:** Always verify resource ownership directly in the server actions using methods like `checkOwnership` and `verifyCampaignOwner` against the current authenticated user session before performing mutations.
## 2025-10-24 - Fix IDOR in character status toggle
**Vulnerability:** IDOR in `updateCharacterStatus` allowed any user to toggle character status (`alive`/`dead`) by providing a valid character ID, without verifying ownership or campaign GM status.
**Learning:** Single-field toggle functions require the same robust authorization checks (`checkOwnership`, `verifyCampaignOwner`, `canEditCharacter`) as full update endpoints, otherwise they are vulnerable to unauthorized modifications.
**Prevention:** Always ensure the user executing a mutation action is authorized to modify the target resource before executing the `findByIdAndUpdate` (or equivalent) database query.
