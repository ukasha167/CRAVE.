import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import { Colors, Radius, Shadows } from '../constants/design';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('AUTHENTICATION REQUIRED', 'PLEASE LOG IN TO COMPLETE YOUR TRANSACTION.');
      return;
    }

    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ user_id: user.id, items: cart, total_amount: cartTotal }),
      });

      if (!response.ok) {
        throw new Error('TRANSACTION FAILED.');
      }

      clearCart();
      router.replace('/success');
    } catch (error: any) {
      Alert.alert('ERROR', error.message || 'TRANSACTION FAILED.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderRightActions = (id: number) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => removeFromCart(id)}
    >
      <Text style={styles.deleteButtonText}>DELETE</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      onSwipeableOpen={() => removeFromCart(item.id)}
    >
      <View style={styles.cartCard}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name.toUpperCase()}
        </Text>
        <View style={styles.itemRight}>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.stepperButtonText}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={styles.stepperQuantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.itemSubtotal}>
            RS. {(parseFloat(item.price) * item.quantity).toFixed(0)}
          </Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BASKET</Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>BASKET IS EMPTY.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DUE</Text>
          <Text style={styles.totalValue}>RS. {cartTotal.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            cart.length === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={cart.length === 0 || isCheckingOut}
        >
          {isCheckingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>CONFIRM TRANSACTION</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -1,
  },
  listContainer: {
    flex: 1,
  },
  cartCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
    flex: 1,
    marginRight: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  stepperButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  stepperQuantity: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '900',
    width: 28,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    minWidth: 60,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  deleteButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 60,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -1,
  },
  checkoutButton: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: 20,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.4,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
