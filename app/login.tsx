import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { login } from '../auth/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Login</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Button
        title="Sign In"
        onPress={async () => {
          const ok = await login(email, password);
          if (!ok) setError('Wrong credentials');
          else router.replace('/');
        }}
      />

      <Text>Demo: 1234/ 1234</Text>
    </View>
  );
}