import { Redirect, router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { ActivityCard } from '@/components/activity/activity-card';
import { HelpLink } from '@/components/help-link';
import { AppText, Screen } from '@/components/ui';
import { EMOTIONS, getActivity, type EmotionId } from '@/content';
import { useSessionStore } from '@/session/store';
import { radius, spacing, usePalette } from '@/theme';

const SWIPE_DISTANCE = 60;

/** Emotions where a quiet link to crisis support is shown during the session. */
const SUPPORT_EMOTIONS = new Set<EmotionId>(['sadness', 'fear', 'anger', 'confused']);

export default function SessionScreen() {
  const session = useSessionStore((s) => s.session);
  const store = useSessionStore();
  const palette = usePalette();
  const { width, height } = useWindowDimensions();

  const goNext = useCallback(() => {
    const finished = useSessionStore.getState().next();
    if (finished) router.replace('/feedback');
  }, []);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_DISTANCE) goNext();
      else if (e.translationX > SWIPE_DISTANCE) useSessionStore.getState().back();
    });

  if (!session) return <Redirect href="/home" />;

  const emotion = EMOTIONS[session.emotionId];
  const activityId = session.activityIds[session.index];
  const activity = getActivity(activityId);
  if (!activity) return <Redirect href="/home" />;
  const progress = session.progress[activityId];
  const visualSize = Math.min(width - spacing.lg * 2, height * 0.34, 300);

  const leave = () => {
    store.end();
    router.dismissTo('/home');
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to the emotion wheel" hitSlop={12} onPress={leave}>
          <AppText muted>‹ Wheel</AppText>
        </Pressable>
        <View style={styles.dots} accessibilityLabel={`Activity ${session.index + 1} of ${session.activityIds.length}`}>
          {session.activityIds.map((id, i) => (
            <View
              key={id}
              style={[
                styles.dot,
                { backgroundColor: i === session.index ? palette.primary : palette.border },
                session.progress[id].status === 'done' && i !== session.index && { backgroundColor: palette.success },
              ]}
            />
          ))}
        </View>
        <View style={styles.topRight}>{SUPPORT_EMOTIONS.has(session.emotionId) ? <HelpLink /> : null}</View>
      </View>

      <View style={styles.chosen}>
        <View style={styles.chosenRow}>
          <AppText variant="lead">You chose “{emotion.name}”</AppText>
          <View style={[styles.swatch, { backgroundColor: emotion.color }]} />
        </View>
        <AppText variant="caption" muted center>
          {emotion.theme}
        </AppText>
      </View>

      <GestureDetector gesture={swipe}>
        <View style={styles.body}>
          <ActivityCard
            key={activity.id}
            activity={activity}
            progress={progress}
            visualSize={visualSize}
            isLast={session.index === session.activityIds.length - 1}
            onStart={() => store.start(activity.id)}
            onPause={() => store.pause(activity.id)}
            onResume={() => store.resume(activity.id)}
            onComplete={() => store.complete(activity.id)}
            onRedo={() => store.redo(activity.id)}
            onReact={(reaction) => store.react(activity.id, reaction)}
            onNext={goNext}
          />
        </View>
      </GestureDetector>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: spacing.xs + 2 },
  topRight: { minWidth: 52, alignItems: 'flex-end' },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  chosen: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  chosenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatch: { width: 16, height: 16, borderRadius: radius.pill },
  body: { flex: 1, marginTop: spacing.lg },
});
