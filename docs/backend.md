# Backend (Supabase)

The app works fully offline. Connecting Supabase adds:

- anonymous accounts for every device, upgraded in place when someone creates an account
- backup and multi-device sync of check-ins, sketches, notes, feedback and activity events
- content (emotions, activities, affirmations) editable from the Supabase dashboard
- an `activity_preferences` view with likes, dislikes, completions, skips and redos per activity

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema and content. Either paste `supabase/migrations/*.sql` and then `supabase/seed.sql`
   into the SQL editor, or with the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```
3. In **Authentication → Sign In / Providers**, turn on **Allow anonymous sign-ins** and keep
   **Email** enabled. Turning on "Confirm email" is recommended.
4. Copy `.env.example` to `.env.local` and fill in the project URL and anon (publishable) key from
   **Project Settings → API**. For EAS builds, add the same two variables to the EAS environment.
5. Restart `npm start`.

## Editing content

Edit rows in `emotions`, `activities` and `affirmations`. Set `activities.active = false` to hide an
activity. Apps pick up changes on their next launch and keep the last good copy offline. If a change
would leave an emotion without any valid activity, the app ignores the whole update and keeps its
previous content.

The bundled copy in `src/content` is the offline fallback. After editing it, run
`npm run seed:generate` to refresh `supabase/seed.sql` (a test fails if they drift apart).

## Data and privacy

- Every user table has row level security: people can only read and write their own rows.
- Ids are created on the device so records can be made offline and uploaded later (upserts by id).
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
