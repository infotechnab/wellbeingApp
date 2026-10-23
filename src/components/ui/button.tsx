import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, usePalette } from '@/theme';

import { AppText } from './app-text';

type Kind = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  kind?: Kind;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, kind = 'primary', disabled, style, ...rest }: ButtonProps) {
  const palette = usePalette();
  const background =
    kind === 'primary' ? palette.primary : kind === 'secondary' ? palette.primarySoft : 'transparent';
  const color = kind === 'primary' ? palette.onPrimary : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        kind === 'ghost' ? styles.ghost : null,
        { backgroundColor: background, borderColor: kind === 'secondary' ? palette.primary : 'transparent' },
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
      {...rest}>
      <AppText
        variant="label"
        style={[{ color }, kind === 'ghost' && { color: palette.primary, textDecorationLine: 'underline' }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    minHeight: 40,
    paddingVertical: spacing.xs,
  },
  dimmed: {
    opacity: 0.6,
  },
});
