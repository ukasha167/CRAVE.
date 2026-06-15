import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.duration(600).springify()} style={styles.title}>
          CRAVE.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.subtitle}>
          NO NONSENSE. JUST FOOD.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth')}>
          <Text style={styles.buttonText}>ENTER SYSTEM ↗</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'space-between', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 72, fontWeight: '900', color: '#0A0A0A', letterSpacing: -3, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#E63946', fontWeight: '700', letterSpacing: 2 },
  footer: { paddingBottom: 40 },
  button: { backgroundColor: '#0A0A0A', padding: 24, alignItems: 'center', borderTopRightRadius: 20 },
  buttonText: { color: '#FAFAFA', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
