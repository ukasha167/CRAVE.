import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import { Colors, Radius, Shadows, Spacing } from '../constants/design';
import Delivery3DMap from '../components/Delivery3DMap';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.40;

interface OrderItem {
  id: number;
  food_item_id: number;
  name: string;
  quantity: number;
  price_at_purchase: string | number;
  image_url?: string;
}

interface OrderDetail {
  id: number;
  user_id: number;
  total_amount: string | number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function TrackScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState('EN ROUTE');

  const fetchOrderDetail = async () => {
    if (!id || !user) return;
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        if (data.status?.toLowerCase() === 'delivered') {
          setDeliveryStatus('DELIVERED');
        }
      }
    } catch (error) {
      console.error('ERROR FETCHING ORDER DETAIL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id, user]);

  const orderRef = React.useRef(order);
  orderRef.current = order;

  const handleStatusChange = React.useCallback(async (newStatus: string) => {
    setDeliveryStatus(newStatus);
    if (newStatus === 'DELIVERED' && orderRef.current && orderRef.current.status?.toLowerCase() !== 'delivered') {
      try {
        await fetch(`${API_URL}/orders/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ status: 'Delivered' }),
        });
        setOrder((prev) => (prev ? { ...prev, status: 'Delivered' } : null));
      } catch (err) {
        console.error('FAILED TO PERSIST DELIVERED STATUS:', err);
      }
    }
  }, [id, user]);

  const items = order?.items || [];
  const totalAmount = parseFloat(String(order?.total_amount || 0));
  const subtotal = items.reduce((acc, it) => acc + parseFloat(String(it.price_at_purchase || 0)) * it.quantity, 0);
  const deliveryFee = 150;

  const isDelivered = deliveryStatus === 'DELIVERED' || order?.status?.toLowerCase() === 'delivered';

  return (
    <View style={styles.container}>
      {/* 3D Map (40% Screen Height) */}
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
        {!isLoading && (
          <Delivery3DMap
            orderId={id as string}
            initialDelivered={order?.status?.toLowerCase() === 'delivered'}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Back Button Floating over Map */}
        <SafeAreaView style={styles.floatingHeader} edges={['top']}>
          <TouchableOpacity
            style={styles.backButtonPill}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Editorial Details Bottom Sheet (60% Height) */}
      <ScrollView
        style={styles.sheetContainer}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Grab Handle */}
        <View style={styles.dragHandle} />

        {/* Order Heading & Status Banner */}
        <View style={styles.headerBlock}>
          <View>
            <Text style={styles.refCode}>REF #{id}</Text>
            <Text style={styles.etaHeading}>
              {isDelivered ? 'ORDER DELIVERED' : 'EST. ARRIVAL: 6-10 MINS'}
            </Text>
          </View>
          <View
            style={[
              styles.liveBadge,
              { backgroundColor: isDelivered ? Colors.successSoft : '#FFF3E0' },
            ]}
          >
            <Text
              style={[
                styles.liveBadgeText,
                { color: isDelivered ? Colors.success : '#E65100' },
              ]}
            >
              {isDelivered ? 'DELIVERED' : 'EN ROUTE'}
            </Text>
          </View>
        </View>

        {/* 4-Step Progress Indicator */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperTrack}>
            <View style={[styles.stepperProgress, { width: isDelivered ? '100%' : '75%' }]} />
          </View>
          <View style={styles.stepperPoints}>
            <View style={styles.stepPoint}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <Text style={styles.stepLabel}>PLACED</Text>
            </View>
            <View style={styles.stepPoint}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <Text style={styles.stepLabel}>PREPARED</Text>
            </View>
            <View style={styles.stepPoint}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <Text style={[styles.stepLabel, !isDelivered && styles.stepLabelHighlight]}>
                ON BIKE
              </Text>
            </View>
            <View style={styles.stepPoint}>
              <View
                style={[
                  styles.stepDot,
                  isDelivered && styles.stepDotActive,
                  !isDelivered && styles.stepDotInactive,
                ]}
              />
              <Text style={[styles.stepLabel, isDelivered && styles.stepLabelHighlight]}>
                ARRIVED
              </Text>
            </View>
          </View>
        </View>

        {/* Courier Dispatch Card */}
        <View style={styles.courierCard}>
          <View style={styles.courierAvatar}>
            <Text style={styles.courierInitials}>TK</Text>
          </View>
          <View style={styles.courierInfo}>
            <View style={styles.courierNameRow}>
              <Text style={styles.courierName}>TARIQ K.</Text>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>★ 4.9</Text>
              </View>
            </View>
            <Text style={styles.courierVehicle}>DELIVERY BIKE #04 • CRAVE DISPATCH</Text>
          </View>
          <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
            <Text style={styles.callButtonText}>CALL</Text>
          </TouchableOpacity>
        </View>

        {/* Destination / Address Info */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>
              APARTMENT 4B, 12TH FLOOR, METRO CENTRAL
            </Text>
            <Text style={styles.addressSubtext}>
              CONTACTLESS DROP-OFF AT DOORSTEP • CODE: 4821
            </Text>
          </View>
        </View>

        {/* Itemized Order Breakdown */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>PURCHASE BREAKDOWN</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.accent} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.itemsList}>
              {items.map((item, index) => {
                const itemPrice = parseFloat(String(item.price_at_purchase || 0));
                const lineTotal = itemPrice * item.quantity;
                return (
                  <View key={item.id || index} style={styles.itemRow}>
                    <View style={styles.itemQuantityBadge}>
                      <Text style={styles.itemQuantityText}>{item.quantity}×</Text>
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name?.toUpperCase()}</Text>
                      <Text style={styles.itemUnitPrice}>
                        RS. {itemPrice.toFixed(0)} EACH
                      </Text>
                    </View>
                    <Text style={styles.itemLineTotal}>
                      RS. {lineTotal.toFixed(0)}
                    </Text>
                  </View>
                );
              })}

              {/* Financial Calculation */}
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>SUBTOTAL</Text>
                <Text style={styles.receiptValue}>RS. {subtotal.toFixed(0)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>EXPRESS BIKE DELIVERY</Text>
                <Text style={styles.receiptValue}>FREE</Text>
                {/*<Text style={styles.receiptValue}>RS. {deliveryFee.toFixed(0)}</Text>*/}
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>TAX & SURCHARGE</Text>
                <Text style={styles.receiptValue}>RS. 0</Text>
              </View>
              <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                <Text style={styles.receiptTotalLabel}>TOTAL PAID</Text>
                <Text style={styles.receiptTotalValue}>
                  RS. {(totalAmount || subtotal + deliveryFee).toFixed(0)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Order Meta Ledger */}
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>
            ORDER TIMESTAMP:{' '}
            {order?.created_at
              ? new Date(order.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).toUpperCase()
              : 'RECENT'}
          </Text>
          <Text style={styles.metaText}>PAYMENT: CARD</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  mapContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#FAF7F2',
  },
  floatingHeader: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 20,
  },
  backButtonPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...Shadows.card,
  },
  backButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  sheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  refCode: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.muted,
    letterSpacing: 1.5,
  },
  etaHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stepperContainer: {
    marginBottom: 24,
    paddingVertical: 6,
  },
  stepperTrack: {
    height: 3,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    position: 'relative',
    marginBottom: 10,
  },
  stepperProgress: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  stepperPoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepPoint: {
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: Colors.accent,
  },
  stepDotInactive: {
    backgroundColor: Colors.border,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 0.8,
  },
  stepLabelHighlight: {
    color: Colors.accent,
    fontWeight: '900',
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    ...Shadows.card,
  },
  courierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courierInitials: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  courierInfo: {
    flex: 1,
  },
  courierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierName: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  ratingPill: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F57F17',
  },
  courierVehicle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  callButton: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.muted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  addressBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  itemsList: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemQuantityBadge: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemQuantityText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.ink,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  itemUnitPrice: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    marginTop: 1,
  },
  itemLineTotal: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 0.8,
  },
  receiptValue: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.ink,
  },
  receiptTotalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1,
  },
  receiptTotalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  metaBox: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 1,
    marginVertical: 2,
  },
});
