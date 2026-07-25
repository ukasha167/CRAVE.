import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useMenu } from "../context/MenuContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Shadows } from "../constants/design";

const CATEGORIES = ["All", "Burgers", "Pizzas", "Desserts", "Drinks"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonLine1} />
    <View style={styles.skeletonLine2} />
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { menu, isLoading, refreshMenu } = useMenu();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [activeCat, setActiveCat] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const hasAnimatedRef = useRef(false);

  const filteredMenu = useMemo(() => {
    return activeCat === "All"
      ? menu
      : menu.filter((i) => i.category === activeCat);
  }, [menu, activeCat]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMenu();
    setRefreshing(false);
  }, [refreshMenu]);

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof filteredMenu)[number]; index: number }) => {
      const shouldAnimate = !hasAnimatedRef.current && index < 6;

      const CardContent = (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/details",
              params: { id: item.id.toString() },
            })
          }
        >
          <Image
            source={item.image_url}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            style={styles.cardImage}
          />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name.toUpperCase()}
            </Text>
            <Text style={styles.cardPrice}>
              RS. {parseFloat(item.price).toFixed(0)}
            </Text>
          </View>
        </TouchableOpacity>
      );

      if (shouldAnimate) {
        return (
          <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
            {CardContent}
          </Animated.View>
        );
      }

      return CardContent;
    },
    [router],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MENU.</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/history")}
            style={styles.headerLink}
          >
            <Text style={styles.historyText}>HISTORY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.headerLink}
          >
            <Text style={styles.cartText}>CART [{cartCount}]</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryContainer}
          renderItem={({ item }) => {
            const isActive = activeCat === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => {
                  hasAnimatedRef.current = true;
                  setActiveCat(item);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Menu Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredMenu}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          onEndReached={() => {
            hasAnimatedRef.current = true;
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.ink}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.ink,
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  headerLink: {
    padding: Spacing.xs,
  },
  historyText: {
    color: Colors.ink,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1,
  },
  cartText: {
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1,
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryPill: {
    backgroundColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: Colors.ink,
  },
  categoryText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  gridContainer: {
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: 16,
    marginHorizontal: 5,
    ...Shadows.card,
  },
  cardImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.accent,
    marginTop: 4,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginBottom: 16,
    marginHorizontal: 5,
    ...Shadows.card,
  },
  skeletonImage: {
    backgroundColor: Colors.border,
    height: 140,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  skeletonLine1: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: "75%",
    height: 12,
    marginTop: 12,
    marginHorizontal: 12,
  },
  skeletonLine2: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: "40%",
    height: 12,
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
});
