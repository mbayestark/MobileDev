import { useEffect, useRef } from 'react';
import { View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReminderScreen from './screens/reminderScreen';
import StepGoalScreen from './screens/stepGoalSCreen';
import StepStatsScreen from './screens/StepStatScreen';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function HomeScreen({ navigation }) {

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Drink Water!",
        body: "Stay hydrated!",
        data: { screen: "Reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 0.5,
      },
    });
  };

  return (<>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <Button
            title="Start Water Reminder"
            onPress={scheduleNotification}
          />
        </View>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <Button title="Go to Step Goal" onPress={() => navigation.navigate("StepGoal")} />
        </View>
  </>);
}

export default function App() {

  const navigationRef = useRef<any>();

  useEffect(() => {

    Notifications.requestPermissionsAsync();

    const subscription =
      Notifications.addNotificationResponseReceivedListener(response => {

        const screen = response.notification.request.content.data.screen;

        if (screen === "Reminder") {
          navigationRef.current?.navigate("Reminder");
        } else if (screen === 'StepStats') {
    const { steps, goal } = response.notification.request.content.data;
    navigationRef.current?.navigate('StepStats', { steps, goal });
  }
      });

    return () => subscription.remove();

  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Reminder" component={ReminderScreen} />
        <Stack.Screen name="StepGoal" component={StepGoalScreen} />
        <Stack.Screen name="StepStats" component={StepStatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}