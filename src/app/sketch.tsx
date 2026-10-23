import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SketchCanvas } from '@/components/sketch/sketch-canvas';
import { SketchThumbnail } from '@/components/sketch/sketch-thumbnail';
import { SketchToolbar } from '@/components/sketch/sketch-toolbar';
import { AppText, Button, Screen } from '@/components/ui';
import type { SketchTool, Stroke } from '@/sketch/model';
import { SAMPLE_SKETCHES } from '@/sketch/samples';
import { useSketchStore } from '@/sketch/store';
import { spacing } from '@/theme';

export default function SketchScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromJournal = from === 'journal';
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<SketchTool>('brush');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const { save, finishOnboarding } = useSketchStore.getState();

  const hasInk = strokes.some((s) => s.tool === 'brush');

  const finish = () => {
    if (hasInk) save({ strokes, width: size.width, height: size.height });
    if (fromJournal) {
      router.back();
      return;
    }
    finishOnboarding();
    router.replace('/home');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title" center>
          Sketch your emotion
        </AppText>
        <AppText muted center>
          Draw how you feel right now. A single dot is enough.
        </AppText>
      </View>

      <View style={styles.samples}>
        <AppText variant="caption" muted>
          Others drew:
        </AppText>
        {SAMPLE_SKETCHES.map((sample) => (
          <SketchThumbnail key={sample.id} sketch={sample} size={44} />
        ))}
      </View>

      <View style={styles.canvas}>
        <SketchCanvas strokes={strokes} tool={tool} onSize={setSize} onStrokeEnd={(stroke) => setStrokes((s) => [...s, stroke])} />
      </View>

      <View style={styles.footer}>
        <SketchToolbar
          tool={tool}
          canUndo={strokes.length > 0}
          onTool={setTool}
          onUndo={() => setStrokes((s) => s.slice(0, -1))}
          onReset={() => setStrokes([])}
        />
        <Button label={hasInk ? 'Done' : fromJournal ? 'Cancel' : 'Skip for now'} kind={hasInk ? 'primary' : 'ghost'} onPress={finish} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  samples: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  canvas: { flex: 1, marginVertical: spacing.md, minHeight: 240 },
  footer: { gap: spacing.md },
});
