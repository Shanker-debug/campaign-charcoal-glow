# LAUNCHLY setup and demonstration

LAUNCHLY uses Lovable Cloud for genuine email/password accounts, PostgreSQL campaign records, moderation, and simulated contributions. Email confirmation remains enabled. The three campaigns marked “Sample campaign” are fictional database seed records with generated photographs. No payment gateway is used.

## Create accounts
1. Register a donor account and confirm its email.
2. Register a separate organizer account and confirm its email. It starts pending.
3. Register the account you intend to administer the platform, confirm it, then have a trusted project owner provision its admin role from the Cloud SQL editor. Never expose this operation in the public application.

```sql
-- Replace the placeholder with the intended account's verified UUID.
-- Run only as a trusted project owner, not from the browser.
update public.user_roles set role = 'admin' where user_id = 'VERIFIED_ACCOUNT_UUID';
```

Find the intended account under Cloud → Users. Sign out and back in after provisioning. Admin status lives only in the protected user_roles table, not editable profile metadata.

## Demonstrate the complete flow
- Open the organizer workspace: pending organizers cannot submit campaigns.
- Log in as the administrator, approve the organizer with the confirmation dialog.
- Log in as the organizer, create a campaign, and submit it. It remains hidden from public exploration.
- As admin, review its story and approve it.
- As donor, open the published campaign, choose an amount, and confirm the demo contribution.
- Verify the amount raised and unique backer count update, then check the donor history.
- Contribute again: amount increases but the same donor remains one unique backer.
- Check another donor cannot read the first donor's private contribution history.
- Organizer campaign edits are limited to unpublished campaigns and return to pending review.
- Rejected accounts cannot create campaigns. Admin roles cannot be chosen at registration.

## Architecture
Page content lives in separate TanStack routes. The root provides shared navigation and account state. Database policies enforce access; scoped SQL functions perform donations and moderation. Donation IDs include an idempotency key to prevent repeated submissions. Funding aggregates reveal only visible campaigns and never donor identities. The shared image resolver supplies category-based fallback photographs. Optional campaign cover photos accept an HTTPS URL; file uploads are not implemented.

## Checks
Run `bunx vitest run src/test/app-routing.test.tsx` for the route smoke test. Verify the above account-based flow and mobile layout manually before a presentation. Never disable email confirmation just to bypass testing.
