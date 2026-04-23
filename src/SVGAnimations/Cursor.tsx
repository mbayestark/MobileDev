import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleGuide } from "../components";

const { PI } = Math;
const COLORS = ["#ff3884", StyleGuide.palette.primary, "#38ffb3"];

interface CursorProps {
  r: number;
  theta: SharedValue<number>;
  strokeWidth: number;
}

const Cursor = ({ r, theta, strokeWidth }: CursorProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      theta.value,
      [0, PI, 2 * PI],
      COLORS
    ) as string,
  }));

  return (
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
  );
};

export default Cursor;
