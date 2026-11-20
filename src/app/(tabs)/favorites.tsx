import {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useFocusEffect} from 'expo-router';
import {marketplace, Catalog} from '@/services/marketplace';
import {ApiError} from '@/services/api';
import {useSession} from '@/context/session';

const s = StyleSheet.create({
    safe: {flex: 1, backgroundColor: '#F5F7FA'},
    list: {padding: 18, paddingBottom: 36, gap: 12},
    title: {fontSize: 24, fontWeight: '800', color: '#101D35', marginBottom: 12},
    card: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 14},
    img: {width: 72, height: 72, borderRadius: 10, backgroundColor: '#EEF1F5'},
    name: {fontWeight: '700', color: '#101D35'},
    meta: {color: '#778196', fontSize: 12, marginTop: 4},
    button: {color: '#F58220', fontWeight: '700', padding: 8},
    heart: {color: '#EF4444', fontSize: 24, padding: 8},
    msg: {textAlign: 'center', color: '#687386', padding: 22},
    cta: {
        alignSelf: 'center',
        backgroundColor: '#F58220',
        padding: 14,
        borderRadius: 10,
        color: '#fff',
        fontWeight: '700'
    }
});
export default function Favorites() {
    const {user} = useSession();
    const [items, setItems] = useState<Catalog[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
    const inFlight = useRef(new Set<number>());
    const generation = useRef(0);
    useEffect(() => {
        generation.current += 1;
        inFlight.current.clear();
        setItems([]);
        setError('');
        if (!user) setLoading(false);
    }, [user?.id]);
    const load = useCallback(async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return
        }
        setLoading(true);
        try {
            const requestGeneration = generation.current;
            const favorites = await marketplace.favorites();
            if (requestGeneration === generation.current) setItems(favorites);
            setError('')
        } catch (e) {
            const x = e as ApiError;
            if (user && x) setError(x.status === 401 || x.status === 403 ? 'Oturumunuz doğrulanamadı. Giriş yapıp tekrar deneyin.' : x.message)
        } finally {
            if (user) setLoading(false)
        }
    }, [user]);
    useFocusEffect(useCallback(() => {
        void load();
        return undefined
    }, [load]));
    const remove = async (id: number) => {
        if (!user || inFlight.current.has(id)) return;
        inFlight.current.add(id);
        const requestGeneration = generation.current;
        try {
            await marketplace.unfavorite(id);
            if (requestGeneration === generation.current) setItems(a => a.filter(x => x.id !== id))
        } catch (e) {
            if (requestGeneration === generation.current) setError(e instanceof Error ? e.message : 'Favoriden çıkarma işlemi başarısız oldu. Lütfen tekrar deneyin.')
        } finally {
            inFlight.current.delete(id)
        }
    };
    return <SafeAreaView style={s.safe} edges={['top']}><FlatList data={user ? items : []} keyExtractor={x => String(x.id)}
                                                                  contentContainerStyle={s.list}
                                                                  refreshControl={<RefreshControl
                                                                      refreshing={loading && items.length > 0}
                                                                      onRefresh={() => void load()}/>}
                                                                  ListHeaderComponent={<Text
                                                                      style={s.title}>Favoriler</Text>}
                                                                  renderItem={({item}) => <View
                                                                      style={s.card}><Pressable style={{
                                                                      flexDirection: 'row',
                                                                      alignItems: 'center',
                                                                      gap: 12,
                                                                      flex: 1
                                                                  }} onPress={() => router.push({
                                                                      pathname: '/catalog/[id]',
                                                                      params: {id: String(item.id)}
                                                                  })}><View style={s.img}/><View style={{flex: 1}}><Text
                                                                      style={s.name}>{item.name}</Text><Text
                                                                      style={s.meta}>{item.brand} · {item.category}</Text><Text
                                                                      style={s.meta}>{item.offers?.length || 0} teklif</Text></View></Pressable><Pressable
                                                                      disabled={inFlight.current.has(item.id)} accessibilityRole="button" accessibilityLabel="Favorilerden çıkar" onPress={() => void remove(item.id)}><Text
                                                                      style={s.heart}>♥</Text></Pressable></View>}
                                                                  ListEmptyComponent={loading ?
                                                                      <ActivityIndicator/> : !user ? <View><Text
                                                                          style={s.msg}>{error || 'Favorilerinizi görmek için giriş yapın.'}</Text><Pressable
                                                                          onPress={() => router.push('/account')}><Text
                                                                          style={s.cta}>Giriş
                                                                          Yap</Text></Pressable></View> : <Text
                                                                          style={s.msg}>{error || 'Henüz favori ürününüz yok.'}</Text>}/></SafeAreaView>
}
