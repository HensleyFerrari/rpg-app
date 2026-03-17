## PALETTE'S JOURNAL

## 2026-03-17 - Icon-only buttons accessibility & Form feedback
**Learning:** Icon-only buttons used for primary navigation and table actions (`FloatingMenu`, `CharacterListView`) frequently lacked `aria-label` attributes, creating a barrier for screen reader users. Additionally, asynchronous form submissions (like `LoginForm`) lacked immediate feedback indicating processing status, potentially leading to double-submissions or user confusion.
**Action:** Consistently enforce `aria-label`s on any button lacking text content. Incorporate loading states (`isLoading`) paired with visual indicators (like `Loader2` from `lucide-react`) and disable interactions (`disabled={isLoading}`) on primary action buttons triggering asynchronous events.
