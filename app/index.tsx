import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { isLoggedIn } from '@/auth/auth';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await isLoggedIn();
      setLoggedIn(ok);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return loggedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}