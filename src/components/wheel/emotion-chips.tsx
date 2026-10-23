import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { EMOTION_INK, EMOTIONS, WHEEL_ORDER, type EmotionId } from '@/content';
import { radius, spacing, usePalette } from '@/theme';

type Props = {
  selected: EmotionId | null;
  onSelect: (id: EmotionId) => void;
};

/**
 * Screen-reader friendly list of the same choices as the wheel. SVG shapes are not reachable by
 * VoiceOver/TalkBack, so this is the accessible way to pick an emotion.
 */
export function EmotionChips({ selected, onSelect }: Props) {
  const palette = usePalette();
  const ids: EmotionId[] = [...WHEEL_ORDER, 'confused'];

  return (
    <View style={styles.row}>
      {ids.map((id) => {
        const isSelected = selected === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={EMOTIONS[id].name}
            onPress={() => onSelect(id)}
            style={[
              styles.chip,
              { backgroundColor: EMOTIONS[id].color, borderColor: isSelected ? palette.primary : 'transparent' },
            ]}>
            <AppText variant="caption" style={{ color: EMOTION_INK, fontWeight: isSelected ? '700' : '500' }}>
              {EMOTIONS[id].name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
});
