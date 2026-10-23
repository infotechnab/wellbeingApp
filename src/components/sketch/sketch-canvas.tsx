/* eslint-disable react-hooks/refs -- the gesture callbacks read the ref on touch events, not during render */
import { useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg from "react-native-svg";

import { appendPoint, type SketchTool, type Stroke } from "@/sketch/model";
import { radius, usePalette } from "@/theme";

import { SketchStrokes } from "./sketch-strokes";

type Props = {
  strokes: Stroke[];
  tool: SketchTool;
  onStrokeEnd: (stroke: Stroke) => void;
  onSize?: (size: { width: number; height: number }) => void;
};

export function SketchCanvas({ strokes, tool, onStrokeEnd, onSize }: Props) {
  const palette = usePalette();
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  // Gesture callbacks need the latest stroke synchronously, before React re-renders.
  const live = useRef<Stroke | null>(null);

  const pan = useMemo(() => {
    const update = (stroke: Stroke | null) => {
      live.current = stroke;
      setCurrent(stroke);
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => update({ tool, points: [e.x, e.y] }))
      .onUpdate((e) => {
        const stroke = live.current;
        if (stroke)
          update({ ...stroke, points: appendPoint(stroke.points, e.x, e.y) });
      })
      .onFinalize(() => {
        const stroke = live.current;
        if (stroke) onStrokeEnd(stroke);
        update(null);
      });
  }, [tool, onStrokeEnd]);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = Math.round(e.nativeEvent.layout.width);
    const height = Math.round(e.nativeEvent.layout.height);
    setLayout({ width, height });
    onSize?.({ width, height });
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessibilityLabel="Drawing canvas"
        style={[
          styles.canvas,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
          <SketchStrokes
            strokes={current ? [...strokes, current] : strokes}
            ink={palette.text}
            paper={palette.surface}
          />
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});
