import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import { Colors, Radius, Shadows, Spacing } from '../constants/design';

interface OrderItem {
  id: number;
  food_item_id: number;
  name: string;
  quantity: number;
  price_at_purchase: string | number;
  image_url?: string;
}

interface Order {
  id: number;
  user_id: number;
  total_amount: string | number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/orders/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('ERROR FETCHING ORDERS:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOrderPress = (orderId: number) => {
    router.push({
      pathname: '/track',
      params: { id: orderId.toString() },
    });
  };

  const renderItem = ({ item }: { item: Order }) => {
    const status = item.status || 'Pending';
    const isPending = status.toLowerCase() === 'pending';
    const isDelivered = status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed';

    const orderDate = new Date(item.created_at);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();

    const items = item.items || [];

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPress={() => handleOrderPress(item.id)}
      >
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>REF #{item.id}</Text>
            <Text style={styles.orderDate}>
              {formattedDate} • {formattedTime}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isDelivered
                  ? Colors.successSoft
                  : isPending
                  ? '#FFF3E0'
                  : '#E0F2FE',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isDelivered
                    ? Colors.success
                    : isPending
                    ? '#E65100'
                    : '#0284C7',
                },
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Itemized Breakdown */}
        <View style={styles.itemsList}>
          {items.length > 0 ? (
            items.map((oi, index) => {
              const unitPrice = parseFloat(String(oi.price_at_purchase || 0));
              const lineTotal = unitPrice * oi.quantity;
              return (
                <View key={oi.id || index} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQuantity}>{oi.quantity}×</Text>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {oi.name ? oi.name.toUpperCase() : 'CRAVE ITEM'}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>
                      RS. {lineTotal.toFixed(0)}
                    </Text>
                    {oi.quantity > 1 && (
                      <Text style={styles.itemUnitPrice}>
                        (RS. {unitPrice.toFixed(0)} EA)
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noItemsText}>ITEMS RECORDED IN SYSTEM</Text>
          )}
        </View>

        {/* Bottom Total & Tracking CTA */}
        <View style={styles.cardFooter}>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>TOTAL DUE</Text>
            <Text style={styles.totalAmount}>
              RS. {parseFloat(String(item.total_amount || 0)).toFixed(0)}
            </Text>
          </View>

          <View style={styles.trackButton}>
            <Text style={styles.trackButtonText}>LIVE TRACK ↗</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEDGER</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={Colors.ink}
          style={{ marginTop: 60 }}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>NO TRANSACTION DATA FOUND.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 12,
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
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  orderDate: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.accent,
    marginRight: 6,
    width: 22,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 0.3,
    flex: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  itemUnitPrice: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  noItemsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  totalBlock: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.muted,
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  trackButton: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 60,
  },
});
