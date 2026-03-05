import { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';

interface Props {
  navigation: any;
}

export default function StepGoalScreen({ navigation }: Props) {
  const [goal, setGoal] = useState<number>(10000);
  const [steps, setSteps] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');

  // Keep track if notification has already been sent
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    // Check pedometer availability
    Pedometer.isAvailableAsync().then(
      result => setIsPedometerAvailable(String(result)),
      error => setIsPedometerAvailable('Error: ' + error)
    );

    // Get steps from past 24 hours
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

    Pedometer.getStepCountAsync(start, end)
      .then(result => {
        setSteps(result.steps);
        if (result.steps >= goal) triggerNotification(result.steps, goal);
      })
      .catch(error => console.log('Could not get steps:', error));

    // Subscribe to live steps
    const subscription = Pedometer.watchStepCount(result => {
      setSteps(prevSteps => {
        const newSteps = result.steps + prevSteps;
        if (newSteps >= goal && !notificationSent) {
          triggerNotification(newSteps, goal);
        }
        return newSteps;
      });
    });

    return () => subscription.remove();
  }, [goal]);

  const triggerNotification = async (stepsCount: number, goalValue: number) => {
    setNotificationSent(true);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Step Goal Reached! 🎉',
        body: `You walked ${stepsCount} steps in the last 24h!`,
        data: { screen: 'StepStats', steps: stepsCount, goal: goalValue },
      },
      trigger: null, // send immediately
    });
  };

  return (
    <View style={styles.container}>
      <Text>Pedometer available: {isPedometerAvailable}</Text>
      <Text>Daily step goal:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={goal.toString()}
        onChangeText={text => {
          const newGoal = Number(text);
          if (!isNaN(newGoal)) {
            setGoal(newGoal);
            setNotificationSent(false); // reset notification when goal changes
          }
        }}
      />
      <Text style={{ marginVertical: 10 }}>Steps in past 24h: {steps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  input: { borderWidth: 1, width: 100, textAlign: 'center', marginVertical: 10, padding: 5 },
});