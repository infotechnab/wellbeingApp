import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { radius, spacing, usePalette } from '@/theme';

type Props = {
  steps: string[];
  onAllChecked: () => void;
};

export function GroundingPanel({ steps, onAllChecked }: Props) {
  const palette = usePalette();
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));

  const toggle = (i: number) => {
    const next = checked.map((value, j) => (j === i ? !value : value));
    setChecked(next);
    if (next.every(Boolean)) onAllChecked();
  };

  return (
    <View style={styles.list}>
      {steps.map((step, i) => (
        <Pressable
          key={step}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: checked[i] }}
          onPress={() => toggle(i)}
          style={[
            styles.item,
            {
              borderColor: checked[i] ? palette.success : palette.border,
              backgroundColor: checked[i] ? palette.surfaceMuted : palette.surface,
            },
          ]}>
          <View style={[styles.box, { borderColor: checked[i] ? palette.success : palette.textMuted, backgroundColor: checked[i] ? palette.success : 'transparent' }]}>
            {checked[i] ? <AppText style={{ color: palette.surface, fontWeight: '700' }}>✓</AppText> : null}
          </View>
          <AppText variant="lead" style={{ flex: 1 }}>
            {step}
          </AppText>
        </Pressable>
      ))}
      <AppText variant="caption" muted center>
        Take your time. Tick each one when you have noticed them.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, width: '100%' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  box: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
