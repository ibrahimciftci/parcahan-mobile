import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/services/api';
import { marketplace, PublicSeller } from '@/services/marketplace';

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F5F7FB' }, list: { padding: 18, gap: 12 }, title: { fontSize: 24, fontWeight: '800', color: '#101D35' }, card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#D8DFEA', padding: 16, gap: 6 }, name: { color: '#101D35', fontSize: 16, fontWeight: '800' }, muted: { color: '#667085' }, message: { color: '#667085', textAlign: 'center', padding: 24 } });
export default function SellersScreen() {
  const [items, setItems] = useState<PublicSeller[]>([]); const [busy, setBusy] = useState(true); const [error, setError] = useState('');
  useEffect(() => { marketplace.sellers().then(page => setItems(page.content)).catch(e => setError(e instanceof ApiError ? e.message : 'Satıcılar yüklenemedi.')).finally(() => setBusy(false)); }, []);
  return <SafeAreaView style={s.safe} edges={['top']}><FlatList data={items} keyExtractor={item => String(item.id)} contentContainerStyle={s.list} ListHeaderComponent={<Text style={s.title}>Satıcıları Keşfet</Text>} renderItem={({item}) => <Pressable accessibilityRole="button" style={s.card} onPress={() => router.push({ pathname: '/seller/[id]', params: { id: String(item.id) } })}><Text style={s.name}>{item.storeName}</Text><Text style={s.muted}>{[item.city, item.district].filter(Boolean).join(' · ') || 'Konum bilgisi yok'}</Text>{item.description ? <Text numberOfLines={2} style={s.muted}>{item.description}</Text> : null}<Text style={s.muted}>{item.offerCount} yayındaki ilan</Text></Pressable>} ListEmptyComponent={busy ? <ActivityIndicator color="#F58220" /> : <Text style={s.message}>{error || 'Henüz görüntülenebilir satıcı bulunamadı.'}</Text>} /> </SafeAreaView>;
}
