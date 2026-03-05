import { View, Text } from 'react-native';

export default function ReminderScreen() {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:22 }}>
        💧 Time to drink water!
      </Text>
    </View>
  );
}