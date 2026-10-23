import { StyleSheet, Text, type TextProps } from 'react-native';

import { fontSize, usePalette } from '@/theme';

type Variant = 'hero' | 'title' | 'lead' | 'body' | 'caption' | 'label';

export type AppTextProps = TextProps & {
  variant?: Variant;
  muted?: boolean;
  center?: boolean;
};

export function AppText({ variant = 'body', muted, center, style, ...rest }: AppTextProps) {
  const palette = usePalette();
  return (
    <Text
      style={[
        styles[variant],
        { color: muted ? palette.textMuted : palette.text },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  hero: { fontSize: fontSize.hero, lineHeight: 38, fontWeight: '600' },
  title: { fontSize: fontSize.title, lineHeight: 32, fontWeight: '600' },
  lead: { fontSize: fontSize.lead, lineHeight: 26, fontWeight: '500' },
  body: { fontSize: fontSize.body, lineHeight: 24 },
  caption: { fontSize: fontSize.caption, lineHeight: 18 },
  label: { fontSize: fontSize.body, lineHeight: 22, fontWeight: '600' },
  center: { textAlign: 'center' },
});
