import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { StyleGuide } from "../components";

const { PI } = Math;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const COLORS = ["#ff3884", StyleGuide.palette.primary, "#38ffb3"];

interface CircularProgressProps {
  theta: SharedValue<number>;
  r: number;
  strokeWidth: number;
}

const CircularProgressSVG = ({
  theta,
  r,
  strokeWidth,
}: CircularProgressProps) => {
  const radius = r - strokeWidth / 2;
  const circumference = radius * 2 * PI;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: theta.value * radius,
    stroke: interpolateColor(
      theta.value,
      [0, PI, 2 * PI],
      COLORS
    ) as string,
  }));

  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Circle
        cx={r}
        cy={r}
        fill="transparent"
        stroke="white"
        r={radius}
        strokeWidth={strokeWidth}
      />
      <AnimatedCircle
        cx={r}
        cy={r}
        fill="transparent"
        r={radius}
        strokeDasharray={`${circumference}, ${circumference}`}
        strokeWidth={strokeWidth}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

export default CircularProgressSVG;
