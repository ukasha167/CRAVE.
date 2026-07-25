import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import { Colors, Spacing, Radius } from '../constants/design';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('ERROR', 'EMAIL AND PASSWORD REQUIRED.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AUTHENTICATION FAILED.');
      }

      setUser({ id: data.user.id, email: data.user.email, token: data.token });
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('ERROR', error.message.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {isLogin ? 'IDENTIFY.' : 'REGISTER.'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="EMAIL ADDRESS"
          placeholderTextColor={Colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor={Colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isSubmitting}
        />

        <Pressable 
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} 
          onPress={handleAuth}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLogin ? 'PROCEED' : 'CREATE'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {isLogin ? 'SWITCH TO SIGN UP' : 'SWITCH TO LOGIN'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: Spacing.xxxl,
  },
  headerText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -2,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 1,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 16,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  toggleText: {
    color: Colors.ink,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
});
