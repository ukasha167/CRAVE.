import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import { Colors, Radius, Shadows } from '../constants/design';

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/orders/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
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

  const renderItem = ({ item }: { item: any }) => {
    const status = item.status || 'Pending';
    const isPending = status.toLowerCase() === 'pending';

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.orderId}>REF #{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at)
                .toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.rightColumn}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isPending ? '#FFF3E0' : Colors.successSoft },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isPending ? '#E65100' : Colors.success },
                ]}
              >
                {status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.orderTotal}>
              RS. {parseFloat(item.total_amount).toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEDGER</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.ink} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>NO DATA FOUND.</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
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
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.ink,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    marginTop: 4,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.accent,
    marginTop: 6,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 60,
  },
});
