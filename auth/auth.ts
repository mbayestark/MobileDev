import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'auth_status';

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function login(email: string, password: string) {
  if (email === '1234' && password === '1234') {
    await setItem(AUTH_KEY, 'logged_in');
    return true;
  }
  return false;
}

export async function logout() {
  await deleteItem(AUTH_KEY);
}

export async function isLoggedIn() {
  const v = await getItem(AUTH_KEY);
  return v === 'logged_in';
}