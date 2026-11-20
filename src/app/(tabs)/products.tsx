import {useEffect, useState, useCallback, useRef} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useFocusEffect} from 'expo-router';
import {marketplace, Catalog, VehicleBrand, VehicleModel, VehicleType} from '@/services/marketplace';
import {assetUrl, ApiError} from '@/services/api';
import {useSession} from '@/context/session';

const navy = '#101D35', orange = '#F58220';
export default function Products() {
    const [items, setItems] = useState<Catalog[]>([]), [page, setPage] = useState(0), [last, setLast] = useState(false), [busy, setBusy] = useState(false), [refreshing, setRefreshing] = useState(false), [error, setError] = useState(''), [filterError, setFilterError] = useState(''), [filtersLoading, setFiltersLoading] = useState(true), [search, setSearch] = useState(''), [categories, setCategories] = useState<string[]>([]), [brands, setBrands] = useState<string[]>([]), [types, setTypes] = useState<VehicleType[]>([]), [vbrands, setVBrands] = useState<VehicleBrand[]>([]), [models, setModels] = useState<VehicleModel[]>([]), [cat, setCat] = useState(''), [brand, setBrand] = useState(''), [typeId, setTypeId] = useState(''), [vehicleBrandId, setVehicleBrandId] = useState(''), [vehicleModelId, setVehicleModelId] = useState('');
    const {user} = useSession();
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const loadingRef = useRef(false);
    const favoriteLocks = useRef(new Set<number>());
    const favoriteRequest = useRef(0);
    const load = useCallback(async (reset = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setBusy(true);
        setError('');
        try {
            const next = reset ? 0 : page;
            const p = await marketplace.catalog({...(search ? {search} : {}), ...(cat ? {category: cat} : {}), ...(brand ? {brand} : {}), ...(typeId ? {vehicleTypeId: typeId} : {}), ...(vehicleBrandId ? {vehicleBrandId} : {}), ...(vehicleModelId ? {vehicleModelId} : {})}, next);
            setItems(previous => {
                const seen = new Set(reset ? [] : previous.map(item => item.id));
                const unique = p.content.filter(item => {
                    if (!item || !Number.isSafeInteger(item.id)) {
                        if (__DEV__) console.warn('[Products] Skipping catalog item with invalid id', item);
                        return false
                    }
                    if (seen.has(item.id)) {
                        if (__DEV__) console.warn(`[Products] Skipping repeated catalog id ${item.id} from page ${next}`);
                        return false
                    }
                    seen.add(item.id);
                    return true
                });
                return reset ? unique : [...previous, ...unique]
            });
            setPage(next + 1);
            setLast(p.last)
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Ürünler yüklenemedi.')
        } finally {
            loadingRef.current = false;
            setBusy(false);
            setRefreshing(false)
        }
    }, [page, search, cat, brand, typeId, vehicleBrandId, vehicleModelId]);
    useFocusEffect(useCallback(() => {
        let active = true;
        if (user) marketplace.favorites().then(v => { if (active) setFavoriteIds(v.map(x => x.id)) }).catch(() => {
        }); else setFavoriteIds([]);
        return () => { active = false };
    }, [user]));
    useEffect(() => {
        favoriteRequest.current += 1;
        setFavoriteIds([]);
    }, [user?.id]);
    useEffect(() => {
        let active = true;
        Promise.all([marketplace.categories(), marketplace.brands(), marketplace.vehicleTypes()]).then(([c, b, t]) => {
            if (active) { setCategories(c); setBrands(b); setTypes(t); setFilterError('') }
        }).catch(e => { if (active) setFilterError(e instanceof ApiError ? e.message : 'Filtre seçenekleri yüklenemedi.') }).finally(() => { if (active) setFiltersLoading(false) });
        return () => { active = false }
    }, []);
    useEffect(() => {
        let active = true;
        setVBrands([]);
        setModels([]);
        setVehicleBrandId('');
        setVehicleModelId('');
        if (typeId) marketplace.vehicleBrands(Number(typeId)).then(value => { if (active) setVBrands(value) }).catch(e => { if (active) setFilterError(e instanceof ApiError ? e.message : 'Araç markaları yüklenemedi.') });
        return () => { active = false }
    }, [typeId]);
    useEffect(() => {
        let active = true;
        setModels([]);
        setVehicleModelId('');
        if (vehicleBrandId) marketplace.vehicleModels(Number(vehicleBrandId), typeId ? Number(typeId) : undefined).then(value => { if (active) setModels(value) }).catch(e => { if (active) setFilterError(e instanceof ApiError ? e.message : 'Araç modelleri yüklenemedi.') });
        return () => { active = false }
    }, [vehicleBrandId, typeId]);
    useEffect(() => {
        const t = setTimeout(() => {
            setItems([]);
            setPage(0);
            setLast(false);
            void load(true)
        }, 350);
        return () => clearTimeout(t)
    }, [search, cat, brand, typeId, vehicleBrandId, vehicleModelId]);
    const clear = () => {
        setSearch('');
        setCat('');
        setBrand('');
        setTypeId('');
        setVehicleBrandId('');
        setVehicleModelId('')
    };
    const toggle = async (id: number) => {
        if (favoriteLocks.current.has(id)) return;
        favoriteLocks.current.add(id);
        const wasFavorite = favoriteIds.includes(id);
        setFavoriteIds(ids => wasFavorite ? ids.filter(x => x !== id) : [...ids, id]);
        try {
            if (wasFavorite) await marketplace.unfavorite(id);
            else await marketplace.favorite(id)
        } catch (e) {
            setFavoriteIds(ids => wasFavorite ? [...ids, id] : ids.filter(x => x !== id));
            Alert.alert('Favoriler', e instanceof ApiError ? e.message : 'Favori güncellenemedi.')
        } finally {
            favoriteLocks.current.delete(id)
        }
    };
    const render = ({item}: { item: Catalog }) => {
        const offer = item.offers?.filter(o => o.active).sort((a, b) => a.price - b.price)[0];
        const photo = offer?.photos?.find(p => p.primaryPhoto)?.url || offer?.photos?.[0]?.url || offer?.legacyImageUrl;
        const isFavorite = favoriteIds.includes(item.id);
        return <Pressable style={s.card}
                          onPress={() => router.push({pathname: '/catalog/[id]', params: {id: String(item.id)}})}><Image
            source={photo ? {uri: assetUrl(photo)!} : undefined} style={s.image}/><View style={{flex: 1}}><Text
            style={s.title}>{item.name}</Text><Text style={s.meta}>{item.brand} · {item.category}</Text><Text
            style={s.price}>{offer ? `${offer.price.toLocaleString('tr-TR')} ₺` : 'Teklif bulunamadı'}</Text></View><Pressable
            disabled={favoriteLocks.current.has(item.id)} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favoriye ekle'} onPress={event => {
                event.stopPropagation();
                if (!user) {
                    Alert.alert('Giriş gerekli', 'Favorilerinizi yönetmek için giriş yapın.', [{text: 'Vazgeç', style: 'cancel'}, {text: 'Giriş Yap', onPress: () => router.push('/account')}]);
                    return
                }
                void toggle(item.id)
            }}><Text style={[s.heart, isFavorite && s.favoriteHeart]}>{isFavorite ? '♥' : '♡'}</Text></Pressable></Pressable>
    };
    return <SafeAreaView style={s.safe} edges={['top']}><FlatList data={items} keyExtractor={x => String(x.id)}
                                                                  renderItem={render} contentContainerStyle={s.list}
                                                                  ListHeaderComponent={<View><Text
                                                                      style={s.heading}>Ürünler</Text><TextInput
                                                                      value={search} onChangeText={setSearch}
                                                                      placeholder="Ürün, marka veya OEM ara"
                                                                      style={s.input}/><View style={s.filters}><Select
                                                                      value={cat} set={setCat} values={categories}
                                                                      prompt="Kategori"/><Select value={brand}
                                                                                                 set={setBrand}
                                                                                                 values={brands}
                                                                                                 prompt="Ürün markası"/><Select
                                                                      value={typeId} set={setTypeId}
                                                                      values={types.map(x => x.name)}
                                                                      ids={types.map(x => String(x.id))}
                                                                      prompt="Araç türü"/><Select value={vehicleBrandId}
                                                                                                  set={setVehicleBrandId}
                                                                                                  values={vbrands.map(x => x.name)}
                                                                                                  ids={vbrands.map(x => String(x.id))}
                                                                                                  prompt="Araç markası"
                                                                                                  disabled={!typeId}/><Select
                                                                      value={vehicleModelId} set={setVehicleModelId}
                                                                      values={models.map(x => x.name)}
                                                                      ids={models.map(x => String(x.id))}
                                                                      prompt="Araç modeli" disabled={!vehicleBrandId}/></View>{filtersLoading ? <Text style={s.info}>Filtre seçenekleri yükleniyor…</Text> : null}{filterError ? <Text style={s.info}>{filterError}</Text> : null}<Pressable
                                                                      onPress={clear}><Text style={s.clear}>Filtreleri
                                                                      temizle</Text></Pressable></View>}
                                                                  ListEmptyComponent={<View>{busy ?
                                                                      <ActivityIndicator color={orange}/> : <Text
                                                                          style={s.info}>{error || 'Ürün bulunamadı.'}</Text>}</View>}
                                                                  ListFooterComponent={busy && items.length > 0 ?
                                                                      <ActivityIndicator
                                                                          color={orange}/> : error && items.length > 0 ?
                                                                          <Text
                                                                              style={s.info}>{error}</Text> : undefined}
                                                                  onEndReached={() => {
                                                                      if (!last && !busy) void load()
                                                                  }} onEndReachedThreshold={0.4}
                                                                  refreshControl={<RefreshControl
                                                                      refreshing={refreshing} onRefresh={() => {
                                                                      setRefreshing(true);
                                                                      void load(true)
                                                                  }} tintColor={orange}/>}/>
    </SafeAreaView>
}

function Select({value, set, values, ids, prompt, disabled}: {
    value: string;
    set: (v: string) => void;
    values: string[];
    ids?: string[];
    prompt: string;
    disabled?: boolean
}) {
    const [visible,setVisible]=useState(false);
    const selectedIndex=(ids||values).indexOf(value);
    const selectedLabel=selectedIndex>=0?values[selectedIndex]:'';
    return <View style={s.select}><Text style={s.selectPrompt}>{prompt}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${prompt}: ${selectedLabel||'Tümü'}`} disabled={disabled} style={s.dropdown} onPress={()=>setVisible(true)}><Text numberOfLines={1} style={s.dropdownText}>{selectedLabel||'Tümü'}</Text><Text style={s.dropdownArrow}>⌄</Text></Pressable><Modal visible={visible} transparent animationType="slide" onRequestClose={()=>setVisible(false)}><View style={s.modalBackdrop}><View style={s.modalSheet}><Text style={s.modalTitle}>{prompt}</Text><ScrollView keyboardShouldPersistTaps="handled"><Pressable style={s.option} onPress={()=>{set('');setVisible(false)}}><Text style={s.optionText}>Tümü</Text></Pressable>{values.length === 0 ? <Text style={s.emptyOptions}>Seçenek bulunamadı.</Text> : values.map((label,index)=><Pressable key={`${label}-${index}`} style={s.option} onPress={()=>{set((ids||values)[index]);setVisible(false)}}><Text style={s.optionText}>{label}</Text></Pressable>)}</ScrollView><Pressable style={s.modalClose} onPress={()=>setVisible(false)}><Text style={s.modalCloseText}>Kapat</Text></Pressable></View></View></Modal></View>
}

const s = StyleSheet.create({
    safe: {flex: 1, backgroundColor: '#F5F7FA'},
    list: {padding: 16, paddingBottom: 30, gap: 12},
    heading: {fontSize: 24, fontWeight: '800', color: navy, marginBottom: 12},
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 13,
        borderWidth: 1,
        borderColor: '#E4E8EF',
        marginBottom: 10
    },
    filters: {gap: 7},
    select: {backgroundColor: '#fff', padding: 9, borderRadius: 10},
    selectPrompt: {fontSize: 11, color: '#687386', fontWeight: '700'},
    dropdown: {marginTop: 6, minHeight: 44, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8DFEA', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
    dropdownText: {flex: 1, color: navy, fontSize: 14}, dropdownArrow: {color: orange, fontSize: 20},
    modalBackdrop: {flex: 1, backgroundColor: 'rgba(16,29,53,0.42)', justifyContent: 'flex-end'},
    modalSheet: {maxHeight: '78%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 28},
    modalTitle: {fontSize: 18, fontWeight: '800', color: navy, marginBottom: 10},
    option: {minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#EDF0F5'},
    optionText: {color: navy, fontSize: 15}, modalClose: {alignItems: 'center', padding: 12}, modalCloseText: {color: orange, fontWeight: '800'},
    emptyOptions: {color: '#667085', textAlign: 'center', padding: 18},
    chip: {
        fontSize: 12,
        color: navy,
        backgroundColor: '#F0F2F6',
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8
    },
    selected: {backgroundColor: '#F58220', color: '#fff'},
    dim: {fontSize: 12, color: '#778196'},
    clear: {color: orange, fontWeight: '700', paddingVertical: 10},
    card: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 14},
    image: {width: 74, height: 74, borderRadius: 10, backgroundColor: '#EEF1F5'},
    title: {fontSize: 14, fontWeight: '700', color: navy},
    meta: {fontSize: 12, color: '#778196', marginTop: 4},
    price: {color: orange, fontWeight: '800', marginTop: 5},
    heart: {fontSize: 24, color: navy},
    favoriteHeart: {color: '#EF4444'},
    info: {padding: 20, color: '#687386', textAlign: 'center'}
});
