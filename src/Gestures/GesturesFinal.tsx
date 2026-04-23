import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SharedValue,
  clamp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { Card, CARD_HEIGHT as DEFAULT_CARD_HEIGHT, cards } from "../components";

const { height } = Dimensions.get("window");
const MARGIN = 16;
const CARD_HEIGHT = DEFAULT_CARD_HEIGHT + MARGIN * 2;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  card: {
    marginVertical: MARGIN,
  },
});

interface WalletCardProps {
  card: number;
  index: number;
  y: SharedValue<number>;
  visibleCards: number;
}

const WalletCard = ({ card, index, y, visibleCards }: WalletCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const positionY = y.value + index * CARD_HEIGHT;
    const isDisappearing = -CARD_HEIGHT;
    const isOnTop = 0;
    const isOnBottom = (visibleCards - 1) * CARD_HEIGHT;
    const isAppearing = visibleCards * CARD_HEIGHT;

    const extraTranslationY = interpolate(
      positionY,
      [isOnBottom, isAppearing],
      [0, -CARD_HEIGHT / 4],
      Extrapolation.CLAMP
    );

    const translateY =
      interpolate(
        y.value,
        [-CARD_HEIGHT * index, 0],
        [-CARD_HEIGHT * index, 0],
        Extrapolation.CLAMP
      ) + extraTranslationY;

    const scale = interpolate(
      positionY,
      [isDisappearing, isOnTop, isOnBottom, isAppearing],
      [0.5, 1, 1, 0.5],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      positionY,
      [isDisappearing, isOnTop, isOnBottom, isAppearing],
      [0.5, 1, 1, 0.5]
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Card {...{ card }} />
    </Animated.View>
  );
};

const Wallet = () => {
  const [containerHeight, setContainerHeight] = useState(height);
  const y = useSharedValue(0);
  const contextY = useSharedValue(0);
  const visibleCards = Math.floor(containerHeight / CARD_HEIGHT);
  const minY = -cards.length * CARD_HEIGHT + visibleCards * CARD_HEIGHT;

  const pan = Gesture.Pan()
    .onStart(() => {
      contextY.value = y.value;
    })
    .onUpdate((e) => {
      y.value = clamp(contextY.value + e.translationY, minY, 0);
    })
    .onEnd((e) => {
      y.value = withDecay({
        velocity: e.velocityY,
        clamp: [minY, 0],
      });
    });

  return (
    <View
      style={styles.container}
      onLayout={({
        nativeEvent: {
          layout: { height: h },
        },
      }) => setContainerHeight(h)}
    >
      <GestureDetector gesture={pan}>
        <Animated.View>
          {cards.map((card, index) => (
            <WalletCard
              key={index}
              {...{ card, index, y, visibleCards }}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Wallet;
