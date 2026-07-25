import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useMenu } from "../context/MenuContext";
import { useCart } from "../context/CartContext";
import { Colors, Spacing, Radius } from "../constants/design";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItemById } = useMenu();
  const { addToCartWithQuantity } = useCart();

  const [qty, setQty] = useState(1);

  const item = getItemById(Number(id));

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ITEM NOT FOUND.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAdd = () => {
    addToCartWithQuantity(
      { id: item.id, name: item.name, price: parseFloat(item.price) },
      qty,
    );
    router.back();
  };

  const price = parseFloat(item.price);

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={item.image_url}
          contentFit="cover"
          transition={400}
          cachePolicy="memory-disk"
          style={styles.heroImage}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>{item.name.toUpperCase()}</Text>
          <Text style={styles.price}>RS. {(price * qty).toFixed(0)}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQty(Math.max(1, qty - 1))}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQty(qty + 1)}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  heroContainer: {
    height: SCREEN_HEIGHT * 0.65,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.ink,
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerArea: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.ink,
    letterSpacing: -1,
    lineHeight: 34,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.accent,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.muted,
    lineHeight: 22,
  },
  controls: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  stepperBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.ink,
  },
  stepperValue: {
    width: 40,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: Colors.ink,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
