/**
 * Writes supabase/seed.sql from the bundled content. Run with `npm run seed:generate`.
 * (Jest is used as the runner because it already understands the app's TypeScript and aliases.)
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

import { buildSeedSql } from '@/content/seed-sql';

it('writes supabase/seed.sql', () => {
  writeFileSync(join(__dirname, '..', 'supabase', 'seed.sql'), buildSeedSql());
});
