import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleGuide } from "../components";

const { width: wWidth } = Dimensions.get("window");
const width = wWidth * 0.8;
const size = 32;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: width,
    width,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#d3d3d3",
    borderTopLeftRadius: width / 2,
    borderTopRightRadius: width / 2,
    borderBottomLeftRadius: width / 2,
  },
  bubble: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: StyleGuide.palette.primary,
  },
});

interface BubbleProps {
  progress: SharedValue<number>;
  index: number;
  total: number;
}

const Bubble = ({ progress, index, total }: BubbleProps) => {
  const delta = 1 / total;
  const start = index * delta;
  const end = start + delta;

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [start, end],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      progress.value,
      [start, end],
      [1, 1.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  return <Animated.View style={[styles.bubble, animatedStyle]} />;
};

interface SimpleActivityIndicatorProps {
  progress: SharedValue<number>;
}

const SimpleActivityIndicator = ({
  progress,
}: SimpleActivityIndicatorProps) => {
  const bubbles = [0, 1, 2];
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {bubbles.map((i) => (
          <Bubble key={i} progress={progress} index={i} total={bubbles.length} />
        ))}
      </View>
    </View>
  );
};

export default SimpleActivityIndicator;
