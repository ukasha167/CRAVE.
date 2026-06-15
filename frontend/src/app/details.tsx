import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalContext';

export default function DetailsScreen() {
  const item = useLocalSearchParams();
  const { addToCart } = useGlobalContext();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const price = parseFloat(item.price as string || '0');

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart({ id: Number(item.id), name: item.name as string, price });
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← RETURN</Text>
      </TouchableOpacity>

      <Image source={{ uri: item.image_url as string }} style={styles.hero} />

      <View style={styles.body}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>{String(item.name).toUpperCase()}</Text>
          <Text style={styles.price}>RS. {price.toFixed(0)}</Text>
        </View>

        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.controls}>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))}><Text style={styles.stepBtn}>-</Text></TouchableOpacity>
            <Text style={styles.stepVal}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(qty + 1)}><Text style={styles.stepBtn}>+</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleAdd}>
            <Text style={styles.actionText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  back: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  backText: { fontSize: 12, fontWeight: '900', color: '#0A0A0A', letterSpacing: 1, backgroundColor: '#FAFAFA', padding: 8, borderWidth: 2 },
  hero: { width: '100%', height: '55%', resizeMode: 'cover' },
  body: { flex: 1, padding: 24, justifyContent: 'space-between' },
  headerBox: { borderBottomWidth: 2, borderColor: '#0A0A0A', paddingBottom: 16, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: '#0A0A0A', letterSpacing: -1, lineHeight: 36 },
  price: { fontSize: 20, fontWeight: '700', color: '#E63946', marginTop: 8 },
  desc: { fontSize: 16, fontWeight: '400', color: '#0A0A0A', lineHeight: 24 },
  controls: { flexDirection: 'row', gap: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#0A0A0A', paddingHorizontal: 16 },
  stepBtn: { fontSize: 24, fontWeight: '900', color: '#0A0A0A', paddingHorizontal: 12 },
  stepVal: { fontSize: 18, fontWeight: '900', width: 30, textAlign: 'center' },
  actionBtn: { flex: 1, backgroundColor: '#E63946', justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  actionText: { color: '#FAFAFA', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
