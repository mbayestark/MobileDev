import React from "react";
import { Dimensions, PixelRatio, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import Cursor from "./CursorFinal";
import CircularProgress from "./CircularProgressFinal";

const { PI } = Math;
const { width } = Dimensions.get("window");
const size = width - 32;
const STROKE_WIDTH = 40;
const r = PixelRatio.roundToNearestPixel(size / 2);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-90deg" }],
  },
  content: {
    width: r * 2,
    height: r * 2,
  },
});

const CircularSlider = () => {
  const theta = useSharedValue(0);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <CircularProgress strokeWidth={STROKE_WIDTH} {...{ r, theta }} />
        </Animated.View>
        <Cursor
          strokeWidth={STROKE_WIDTH}
          r={r - STROKE_WIDTH / 2}
          {...{ theta }}
        />
      </View>
    </View>
  );
};

export default CircularSlider;
