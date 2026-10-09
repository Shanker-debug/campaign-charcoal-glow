<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared navigation and the account provider in the root layout, and page-specific content in separate TanStack leaf routes, so navigation and account state stay consistent.
- Read and mutate application data through the generated browser client with database-enforced policies and scoped RPCs; never use client-side role checks as authorization.
- Store privileged roles separately in user_roles, with signup defaulting to donor or pending organizer, so editable profile data cannot grant permissions.
- Derive funding totals exclusively from donation records via the visibility-scoped aggregate function, so the frontend cannot forge campaign progress.
- Keep sample campaign imagery in the shared image resolver and identify sample rows explicitly, so example content never disguises itself as real fundraising.
