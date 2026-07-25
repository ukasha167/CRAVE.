import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '../constants/design';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text
          entering={FadeInDown.duration(600)}
          style={styles.title}
        >
          CRAVE.
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.subtitle}
        >
          NO NONSENSE. JUST FOOD.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.footer}
      >
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.buttonText}>ENTER SYSTEM ↗</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -3,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
