import type { Activity } from '@/content';
import type { ActivityProgress } from '@/session/model';

import { GroundingPanel } from './grounding-panel';
import { GuideVisual } from './guide/guide-visual';
import { SharePanel } from './share-panel';
import { WritePanel } from './write-panel';

export type ActivityVisualProps = {
  activity: Activity;
  progress: ActivityProgress;
  /** Seconds left, or undefined for untimed activities. */
  remaining?: number;
  /** Total length in seconds, or undefined for untimed activities. */
  total?: number;
  /** Seconds since the current run started. */
  elapsedSec: number;
  size: number;
  onComplete: () => void;
  onSaveNote: (text: string) => void;
};

/** Activity kinds whose running state is an interactive panel instead of a countdown. */
export const INTERACTIVE_KINDS = new Set<Activity['kind']>(['share', 'write', 'grounding']);

export function ActivityVisual(props: ActivityVisualProps) {
  const { activity, progress, remaining, total, elapsedSec, size, onComplete, onSaveNote } = props;

  if (INTERACTIVE_KINDS.has(activity.kind) && progress.status === 'running') {
    switch (activity.kind) {
      case 'share':
        return <SharePanel templates={activity.templates ?? []} onShared={onComplete} />;
      case 'write':
        return <WritePanel placeholder={activity.placeholder} onSave={onSaveNote} />;
      case 'grounding':
        return <GroundingPanel steps={activity.steps ?? []} onAllChecked={onComplete} />;
    }
  }

  return <GuideVisual activity={activity} progress={progress} elapsedSec={elapsedSec} remaining={remaining} total={total} size={size} />;
}
