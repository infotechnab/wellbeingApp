# Backend (Supabase)

The app works fully offline. Connecting Supabase adds:

- an anonymous (guest) account for every device, so likes, skips and feedback reach you even from
  people who never sign up
- optional email accounts that back up check-ins, sketches and notes and bring them to other devices
- upload of feedback and activity events
- content (emotions, activities, affirmations) editable from the Supabase dashboard
- an `activity_preferences` view with likes, dislikes, completions, skips and redos per activity

## Setup

1. Create a project at [supabase.com](https://supabase.com). Pick the **South Asia (Mumbai)** region,
   the closest one to Nepal.
2. Apply the schema and content. Either paste `supabase/migrations/*.sql` and then `supabase/seed.sql`
   into the SQL editor, or with the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```
3. In **Authentication → Sign In / Providers**, turn on **Allow anonymous sign-ins** and keep
   **Email** enabled. Keep **Confirm email** off until the project has its own email service
   (**Authentication → SMTP Settings**): Supabase's built-in email sends only 2 emails an
   hour, and only to members of your Supabase team, so confirmations would block other testers. When
   you turn it on, set the **Site URL** in **Authentication → URL Configuration** to where the web app
   is hosted; confirmation links land there, and people then sign in from the app.
4. Put the Project URL and publishable key (from the dashboard's **Connect** button, or
   **Settings → API Keys**) in `.env`. The app's own project is already there, and EAS builds use it
   because the file is committed. To try another project locally, copy `.env.example` to `.env.local`
   instead; it overrides `.env`.
5. Restart `npm start`.

## Editing content

Edit rows in `emotions`, `activities` and `affirmations`. Set `activities.active = false` to hide an
activity. Apps pick up changes on their next launch and keep the last good copy offline. If a change
would leave an emotion without any valid activity, the app ignores the whole update and keeps its
previous content.

The bundled copy in `src/content` is the offline fallback. After editing it, run
`npm run seed:generate` to refresh `supabase/seed.sql` (a test fails if they drift apart).

## Accounts

The device is the source of truth and the server is a backup:

1. On first launch the app signs in anonymously and uploads events, feedback and check-ins as a guest.
2. **Create account** makes a normal email account. When it is signed in (straight away, or after the
   confirmation link if "Confirm email" is on), the device uploads its check-ins, sketches and notes
   again under the new account. Events and feedback are not uploaded twice, so statistics stay right.
3. **Sign in** on another device downloads the account's journal and adds anything done there as a guest.
4. **Log out** uploads anything pending, removes personal data from the device and starts a new guest.

Guest accounts pile up over time. You can remove old ones from **Authentication → Users**, but that
also deletes their events from the statistics.

## Data and privacy

- Every user table has row level security: people can only read and write their own rows.
- Ids are created on the device so records can be made offline and uploaded later. Keys are
  `(user_id, id)`, so the same record can belong to a guest and to the account it moved into.
- Logging out uploads anything pending, then removes personal data from the device.
- Sketches and notes are never shown to other users.

## Useful queries

```sql
-- Which activities people like or skip most
select * from activity_preferences order by dislikes desc;

-- Recent feedback
select created_at, emotion_id, message from feedback order by created_at desc limit 50;
```

Run these from the SQL editor (it uses the service role, which bypasses row level security).
