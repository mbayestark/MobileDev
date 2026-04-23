import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, CARD_WIDTH, Card, StyleGuide, cards } from "../components";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleGuide.palette.background,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: StyleGuide.spacing * 4,
  },
});

const alpha = Math.PI / 6;

interface AnimatedCardProps {
  card: number;
  index: number;
  transition: Animated.SharedValue<number>;
}

const AnimatedCard = ({ card, index, transition }: AnimatedCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      transition.value,
      [0, 1],
      [0, (index - 1) * alpha]
    );
    return {
      transform: [
        { translateX: -CARD_WIDTH / 2 },
        { rotate: `${rotate}rad` },
        { translateX: CARD_WIDTH / 2 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <Card {...{ card }} />
    </Animated.View>
  );
};

const UseTransition = () => {
  const [toggled, setToggle] = useState(false);
  const transition = useSharedValue(0);

  useEffect(() => {
    transition.value = withTiming(toggled ? 1 : 0, { duration: 400 });
  }, [toggled]);

  return (
    <View style={styles.container}>
      {cards.slice(0, 3).map((card, index) => (
        <AnimatedCard key={card} {...{ card, index, transition }} />
      ))}
      <Button
        label={toggled ? "Reset" : "Start"}
        primary
        onPress={() => setToggle((prev) => !prev)}
      />
    </View>
  );
};

export default UseTransition;
