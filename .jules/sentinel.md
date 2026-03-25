## 2024-05-18 - IDOR on NPC management
**Vulnerability:** Insecure Direct Object Reference (IDOR) on `updateNPC` and `deleteNPC` in `lib/actions/NPC.actions.ts`. Any authenticated user could update or delete any NPC, bypassing ownership and campaign master checks.
**Learning:** Server Actions must validate the ownership of resources directly, even when UI components restrict certain elements based on state, because they are direct API endpoints.
**Prevention:** Always verify resource ownership directly in the server actions using methods like `checkOwnership` and `verifyCampaignOwner` against the current authenticated user session before performing mutations.
## 2025-10-24 - Fix IDOR in character status toggle
**Vulnerability:** IDOR in `updateCharacterStatus` allowed any user to toggle character status (`alive`/`dead`) by providing a valid character ID, without verifying ownership or campaign GM status.
**Learning:** Single-field toggle functions require the same robust authorization checks (`checkOwnership`, `verifyCampaignOwner`, `canEditCharacter`) as full update endpoints, otherwise they are vulnerable to unauthorized modifications.
**Prevention:** Always ensure the user executing a mutation action is authorized to modify the target resource before executing the `findByIdAndUpdate` (or equivalent) database query.
## 2025-10-25 - Add Server-Side Input Validation on User Registration
**Vulnerability:** The `register` server action (`actions/register.ts`) trusted client-provided inputs (`values: any`) without validating them on the server-side, potentially exposing the application to injection or invalid data and it was logging raw errors `console.log(e)` which could leak sensitive internal details.
**Learning:** Client-side validation is easily bypassed. Server actions must implement strict server-side input validation and error handling to ensure data integrity and prevent information leakage.
**Prevention:** Always use a validation library like `zod` to validate all incoming data in server actions before processing it, and use generic error messages in catch blocks.
## 2025-10-26 - Fix ReDoS Vulnerability in MongoDB $regex queries
**Vulnerability:** The application passed user input directly to the `$regex` operator in MongoDB queries for `getCampaigns` and `getBattles`. This could allow attackers to perform Regular Expression Denial of Service (ReDoS) attacks by crafting complex regex strings.
**Learning:** Any user input that is passed to a regex evaluation engine needs to be sanitized to prevent attackers from sending deliberately slow-to-evaluate regexes that can freeze the application or database.
**Prevention:** Always escape regex special characters from user input before passing it to MongoDB `$regex` or the JavaScript `RegExp` constructor. A utility function `escapeRegExp` was added to `lib/utils.ts` and applied where needed.
