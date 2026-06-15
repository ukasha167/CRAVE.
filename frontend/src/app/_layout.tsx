import { Stack } from 'expo-router';
import { GlobalProvider } from '../context/GlobalContext';

export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F9FA' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="home" />
        <Stack.Screen name="details" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="success" />
        <Stack.Screen name="history" />
      </Stack>
    </GlobalProvider>
  );
}
