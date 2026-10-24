import { Pressable, StyleSheet, View } from 'react-native';

import { ThumbIcon } from '@/components/icons';
import type { Reaction } from '@/session/model';
import { radius, spacing, usePalette } from '@/theme';

type Props = {
  value?: Reaction;
  onToggle: (reaction: Reaction) => void;
};

export function ReactionButtons({ value, onToggle }: Props) {
  const palette = usePalette();
  const item = (reaction: Reaction, label: string) => {
    const active = value === reaction;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        hitSlop={8}
        onPress={() => onToggle(reaction)}
        style={[
          styles.button,
          { borderColor: active ? palette.primary : palette.border, backgroundColor: active ? palette.primarySoft : 'transparent' },
        ]}>
        <ThumbIcon down={reaction === 'dislike'} color={active ? palette.primary : palette.textMuted} size={22} />
      </Pressable>
    );
  };

  return (
    <View style={styles.row}>
      {item('like', 'I like this activity')}
      {item('dislike', 'I don’t like this activity')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
