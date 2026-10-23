import { readFileSync } from 'fs';
import { join } from 'path';

import { buildSeedSql } from '../seed-sql';

describe('supabase/seed.sql', () => {
  it('matches the bundled content (run `npm run seed:generate` after editing content)', () => {
    const committed = readFileSync(join(__dirname, '..', '..', '..', 'supabase', 'seed.sql'), 'utf8');
    expect(committed).toBe(buildSeedSql());
  });
});
