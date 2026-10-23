import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { SketchTool } from '@/sketch/model';
import { radius, spacing, usePalette } from '@/theme';

type Props = {
  tool: SketchTool;
  canUndo: boolean;
  onTool: (tool: SketchTool) => void;
  onUndo: () => void;
  onReset: () => void;
};

export function SketchToolbar({ tool, canUndo, onTool, onUndo, onReset }: Props) {
  const palette = usePalette();
  const item = (label: string, onPress: () => void, opts: { active?: boolean; disabled?: boolean } = {}) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!opts.active, disabled: !!opts.disabled }}
      disabled={opts.disabled}
      onPress={onPress}
      style={[
        styles.item,
        {
          backgroundColor: opts.active ? palette.primarySoft : 'transparent',
          borderColor: opts.active ? palette.primary : palette.border,
          opacity: opts.disabled ? 0.4 : 1,
        },
      ]}>
      <AppText variant="caption" style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {item('Brush', () => onTool('brush'), { active: tool === 'brush' })}
      {item('Eraser', () => onTool('eraser'), { active: tool === 'eraser' })}
      {item('Undo', onUndo, { disabled: !canUndo })}
      {item('Reset', onReset, { disabled: !canUndo })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 64,
    alignItems: 'center',
  },
});
