import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import HomeScreen from "../../screens/home";
import SettingsScreen from "../../screens/settings";

const Drawer = createDrawerNavigator();

export default function DrawerNav() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Theme" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}