import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { StyleGuide } from "../components";

const { PI } = Math;
const COLORS = ["#ff3884", StyleGuide.palette.primary, "#38ffb3"];

interface CursorProps {
  r: number;
  theta: SharedValue<number>;
  strokeWidth: number;
}

const Cursor = ({ r, theta, strokeWidth }: CursorProps) => {
  const center = { x: r, y: r };
  const startTheta = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startTheta.value = theta.value;
    })
    .onUpdate((e) => {
      "worklet";
      const startX = center.x + r * Math.cos(startTheta.value);
      const startY = center.y + r * Math.sin(startTheta.value);
      const x = startX + e.translationX;
      const y = startY + e.translationY;
      let t = Math.atan2(y - center.y, x - center.x);
      if (t < 0) t += 2 * PI;
      theta.value = t;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = center.x + r * Math.cos(theta.value);
    const translateY = center.y + r * Math.sin(theta.value);
    const backgroundColor = interpolateColor(
      theta.value,
      [0, PI, 2 * PI],
      COLORS
    ) as string;
    return {
      backgroundColor,
      transform: [{ translateX }, { translateY }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidth / 2,
            borderColor: "white",
            borderWidth: 5,
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
};

export default Cursor;
