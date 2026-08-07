import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { MenuProvider } from '../context/MenuContext';
import { CartProvider } from '../context/CartContext';
import { Colors } from '../constants/design';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.surface },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="auth" />
              <Stack.Screen name="home" options={{ animation: 'fade' }} />
              <Stack.Screen name="details" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="success" options={{ animation: 'fade' }} />
              <Stack.Screen name="history" />
              <Stack.Screen name="track" />
            </Stack>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
