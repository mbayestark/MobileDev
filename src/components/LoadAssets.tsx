import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export type FontSource = Parameters<typeof Font.loadAsync>[0];

interface LoadAssetsProps {
  fonts?: FontSource;
  assets?: number[];
  children: ReactElement | ReactElement[];
}

const LoadAssets = ({ assets, fonts, children }: LoadAssetsProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const promises: Promise<unknown>[] = [];
        if (fonts) promises.push(Font.loadAsync(fonts));
        if (assets)
          promises.push(...assets.map((asset) => Asset.loadAsync(asset)));
        await Promise.all(promises);
      } finally {
        setReady(true);
      }
    };
    load();
  }, []);

  const onReady = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <NavigationContainer onReady={onReady}>{children}</NavigationContainer>
  );
};

export default LoadAssets;
