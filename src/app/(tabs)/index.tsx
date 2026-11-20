import {useEffect, useState} from 'react';
import {ScrollView, View, Text, TextInput, Pressable, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {marketplace, Catalog, PublicSeller} from '@/services/marketplace';
import {assetUrl} from '@/services/api';

const navy = '#101D35';
const orange = '#F58220';
const categories = ['Motor', 'Fren', 'Filtre', 'Elektrik', 'Kaporta'];

export default function HomeScreen() {
    const [products, setProducts] = useState<Catalog[]>([]);
    const [sellers, setSellers] = useState<PublicSeller[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingSellers, setLoadingSellers] = useState(true);
    const [productError, setProductError] = useState('');
    const [sellerError, setSellerError] = useState('');
    useEffect(() => {
        marketplace.catalog({}, 0).then(page => setProducts(page.content.slice(0, 4))).catch(e => {setProducts([]);setProductError(e instanceof Error?e.message:'Ürünler yüklenemedi.')}).finally(() => setLoadingProducts(false));
        marketplace.sellers(0).then(page => setSellers(page.content.slice(0, 4))).catch(e => {setSellers([]);setSellerError(e instanceof Error?e.message:'Satıcılar yüklenemedi.')}).finally(() => setLoadingSellers(false));
    }, []);
    return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page}>
        <View style={s.header}><Image source={require('@/assets/images/parcahan-emblem.png')} style={s.emblem}
                                      resizeMode="contain" accessibilityLabel="ParçaHan amblemi"/><View
            style={s.brandBlock}><Text numberOfLines={1} adjustsFontSizeToFit style={s.brand}><Text
            style={{color: navy}}>Parça</Text><Text style={{color: orange}}>Han</Text></Text><Text style={s.caption}>Yedek
            parçada doğru adres</Text></View></View>
        <TextInput placeholder="Ürün, marka veya araç ara" placeholderTextColor="#778196" style={s.search}/>
        <View style={s.hero}><Text style={s.heroTitle}>Aradığın parça burada</Text><Text style={s.heroText}>İhtiyacın
            olan yedek parçayı keşfet.</Text><Pressable style={s.button} accessibilityRole="button" onPress={() => router.navigate('/products')}><Text style={s.buttonText}>Ürünleri keşfet
            ›</Text></Pressable></View>
        <View style={s.row}><Text style={s.heading}>Kategoriler</Text><Text style={s.more}>Tümünü gör</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.categories}>{categories.map((x, i) => <View key={x}
                                                                                         style={s.category}><Text
            style={s.catIcon}>{['⚙', '◉', '▤', 'ϟ', '▱'][i]}</Text><Text
            style={s.catText}>{x}</Text></View>)}</ScrollView>
        <View style={s.row}><Text style={s.heading}>Öne çıkanlar</Text><Pressable onPress={() => router.navigate('/products')}><Text style={s.more}>Tüm ürünler</Text></Pressable></View>
        {loadingProducts ? <ActivityIndicator color={orange}/> : products.length ? products.map(item => {const offer=item.offers?.filter(o=>o.active).sort((a,b)=>a.price-b.price)[0];const photo=offer?.photos?.find(p=>p.primaryPhoto)?.url||offer?.photos?.[0]?.url||offer?.legacyImageUrl;return <Pressable accessibilityRole="button" style={s.product} key={item.id} onPress={()=>router.push({pathname:'/catalog/[id]',params:{id:String(item.id)}})}><Image source={photo?{uri:assetUrl(photo)||undefined}:undefined} style={s.productImage}/><View style={{flex:1,minWidth:0}}><Text numberOfLines={2} style={s.productName}>{item.name}</Text><Text numberOfLines={1} style={s.muted}>{item.brand} · {item.category}</Text><Text style={s.price}>{offer?`${offer.price.toLocaleString('tr-TR')} ₺`:'Teklif bulunamadı'}</Text></View></Pressable>}) : <Text style={s.muted}>{productError||'Şu anda öne çıkan ürün yok.'}</Text>}
        <View style={s.row}><Text style={s.heading}>Satıcıları keşfet</Text><Pressable onPress={()=>router.push('/sellers')}><Text style={s.more}>Tüm satıcılar</Text></Pressable></View><Text style={s.muted}>Güvenilir satıcılardan yedek parçaları incele.</Text>
        {loadingSellers?<ActivityIndicator color={orange}/>:sellers.length?sellers.map(seller=><Pressable accessibilityRole="button" key={seller.id} style={s.sellers} onPress={()=>router.push({pathname:'/seller/[id]',params:{id:String(seller.id)}})}><Text style={s.heading}>{seller.storeName}</Text><Text style={s.muted}>{[seller.city,seller.district].filter(Boolean).join(' · ')||'Konum bilgisi yok'} · {seller.offerCount} ilan</Text></Pressable>):<Text style={s.muted}>{sellerError||'Henüz görüntülenebilir satıcı yok.'}</Text>}
    </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
    safe: {flex: 1, backgroundColor: '#F5F7FA'},
    page: {padding: 18, paddingBottom: 40, gap: 14},
    header: {minHeight: 70, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 12},
    emblem: {width: 88, height: 66},
    brandBlock: {flex: 1, minWidth: 0, gap: 2},
    brand: {fontSize: 30, fontWeight: '900', color: navy, includeFontPadding: false},
    caption: {color: '#687386', fontSize: 12, marginTop: 2},
    search: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E4E8EF',
        fontSize: 15
    },
    hero: {backgroundColor: navy, borderRadius: 18, padding: 20, gap: 8},
    heroTitle: {color: '#fff', fontSize: 22, fontWeight: '800'},
    heroText: {color: '#D7DEEA', fontSize: 14},
    button: {
        alignSelf: 'flex-start',
        backgroundColor: orange,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginTop: 4
    },
    buttonText: {color: '#fff', fontWeight: '700'},
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
    heading: {fontSize: 18, fontWeight: '800', color: navy},
    more: {color: orange, fontWeight: '700', fontSize: 13},
    categories: {gap: 10, paddingVertical: 3},
    category: {
        width: 78,
        height: 82,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        gap: 6
    },
    catIcon: {fontSize: 23, color: orange},
    catText: {fontSize: 12, fontWeight: '600', color: navy},
    product: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 14
    },
    productImage: {
        width: 62,
        height: 62,
        borderRadius: 12,
        backgroundColor: '#F0F2F6',
        alignItems: 'center',
        justifyContent: 'center'
    },
    productName: {fontSize: 14, fontWeight: '700', color: navy},
    muted: {fontSize: 12, color: '#778196', marginTop: 4},
    price: {fontSize: 14, fontWeight: '800', color: orange, marginTop: 5},
    heart: {fontSize: 24, color: navy},
    sellers: {backgroundColor: '#fff', padding: 16, borderRadius: 14, gap: 6},
    note: {textAlign: 'center', fontSize: 11, color: '#8791A2'}
});
