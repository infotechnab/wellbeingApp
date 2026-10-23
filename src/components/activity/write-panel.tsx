import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
import { fontSize, radius, spacing, usePalette } from '@/theme';

type Props = {
  placeholder?: string;
  initialText?: string;
  onSave: (text: string) => void;
};

export function WritePanel({ placeholder, initialText = '', onSave }: Props) {
  const palette = usePalette();
  const [text, setText] = useState(initialText);

  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel="Your next step"
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        multiline
        maxLength={280}
        textAlignVertical="top"
        style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
      />
      <Button label="Save to journal" disabled={!text.trim()} onPress={() => onSave(text.trim())} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, width: '100%' },
  input: { minHeight: 110, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: fontSize.body },
});
