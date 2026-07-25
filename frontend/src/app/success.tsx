import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '../constants/design';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          entering={ZoomIn.delay(200).duration(400)}
          style={styles.circle}
        >
          <Text style={styles.checkText}>✓</Text>
        </Animated.View>
        <Animated.Text 
          entering={FadeIn.delay(400).duration(400)}
          style={styles.title}
        >
          DONE.
        </Animated.Text>
        <Animated.Text 
          entering={FadeIn.delay(600).duration(400)}
          style={styles.subtitle}
        >
          TRANSACTION RECORDED.
        </Animated.Text>
      </View>

      <Pressable 
        style={styles.button}
        onPress={() => router.replace('/home')}
      >
        <Text style={styles.buttonText}>RETURN TO MENU ↗</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.accent,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  checkText: {
    color: '#FAFAFA',
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: -4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 2,
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 16,
  },
});
