import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';

import { useToast } from '@/components/toast';
import { AppText, Button } from '@/components/ui';
import { fontSize, radius, spacing, usePalette } from '@/theme';

type Props = {
  templates: string[];
  onShared: () => void;
};

/** Pick a template, edit it freely, then copy it or send it through the system share sheet. */
export function SharePanel({ templates, onShared }: Props) {
  const palette = usePalette();
  const [text, setText] = useState<string | null>(null);
  const showToast = useToast((s) => s.show);

  const copy = async () => {
    if (!text?.trim()) return;
    await Clipboard.setStringAsync(text.trim());
    showToast('Copied. Paste it into any app.');
    onShared();
  };

  const share = async () => {
    if (!text?.trim()) return;
    const message = text.trim();
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator | undefined;
        if (nav?.share) await nav.share({ text: message });
        else {
          await copy();
          return;
        }
      } else {
        const result = await Share.share({ message });
        if (result.action === Share.dismissedAction) return;
      }
      onShared();
    } catch {
      // The user closed the share sheet; nothing to do.
    }
  };

  if (text === null) {
    return (
      <View style={styles.list}>
        <AppText variant="caption" muted>
          Tap a message to make it yours:
        </AppText>
        {templates.map((template) => (
          <Pressable
            key={template}
            accessibilityRole="button"
            onPress={() => setText(template)}
            style={[styles.template, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <AppText>{template}</AppText>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <TextInput
        accessibilityLabel="Your message"
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        textAlignVertical="top"
        style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.primary }]}
      />
      <View style={styles.actions}>
        <Button label="Copy" kind="secondary" onPress={copy} style={styles.action} />
        <Button label="Share" onPress={share} style={styles.action} />
      </View>
      <Button label="Choose another message" kind="ghost" onPress={() => setText(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, width: '100%' },
  template: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  input: { minHeight: 120, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: fontSize.body },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
