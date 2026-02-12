import { View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from '../components/theme/ThemeContext';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.text, { color: theme.text }]}>
          {isDark ? 'Dark Theme' : 'Light Theme'}
        </Text>

        <Button
          title="Toggle Theme"
          color={theme.primary}
          onPress={toggleTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});
