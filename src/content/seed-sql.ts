import { ACTIVITIES } from './activities';
import { AFFIRMATIONS } from './affirmations';
import { EMOTIONS, WHEEL_ORDER } from './emotions';
import type { EmotionId } from './types';

const q = (value: string | number | null | undefined | object): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${value.replace(/'/g, "''")}'`;
};

/** SQL that loads the bundled content into Supabase. Kept in sync by a test. */
export function buildSeedSql(): string {
  const order: EmotionId[] = [...WHEEL_ORDER, 'confused'];
  const lines = ['-- Generated from src/content by `npm run seed:generate`. Do not edit by hand.', ''];

  lines.push('insert into public.emotions (id, name, theme, need, body_response, color, sort_order) values');
  lines.push(
    order
      .map((id, i) => {
        const e = EMOTIONS[id];
        return `  (${[e.id, e.name, e.theme, e.need, e.bodyResponse, e.color].map(q).join(', ')}, ${i})`;
      })
      .join(',\n') + '\non conflict (id) do update set name = excluded.name, theme = excluded.theme, need = excluded.need, body_response = excluded.body_response, color = excluded.color, sort_order = excluded.sort_order;',
  );
  lines.push('');

  const position: Partial<Record<EmotionId, number>> = {};
  lines.push(
    'insert into public.activities (id, emotion_id, sort_order, kind, title, instruction, duration_sec, breath, steps, templates, placeholder, research) values',
  );
  lines.push(
    ACTIVITIES.map((a) => {
      const sort = (position[a.emotionId] = (position[a.emotionId] ?? -1) + 1);
      return `  (${[a.id, a.emotionId, sort, a.kind, a.title, a.instruction, a.durationSec, a.breath, a.steps, a.templates, a.placeholder, a.research]
        .map(q)
        .join(', ')})`;
    }).join(',\n') +
      '\non conflict (id) do update set emotion_id = excluded.emotion_id, sort_order = excluded.sort_order, kind = excluded.kind, title = excluded.title, instruction = excluded.instruction, duration_sec = excluded.duration_sec, breath = excluded.breath, steps = excluded.steps, templates = excluded.templates, placeholder = excluded.placeholder, research = excluded.research;',
  );
  lines.push('');

  lines.push('delete from public.affirmations;');
  lines.push('insert into public.affirmations (text) values');
  lines.push(AFFIRMATIONS.map((text) => `  (${q(text)})`).join(',\n') + ';');
  lines.push('');
  return lines.join('\n');
}
