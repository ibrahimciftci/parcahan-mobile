import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const navy = '#101D35';
const orange = '#F58220';
const categories = ['Motor', 'Fren', 'Filtre', 'Elektrik', 'Kaporta'];
const products = ['Fren balata seti', 'Yağ filtresi', 'Motor takozu'];

export default function HomeScreen() {
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page}>
    <View style={s.header}><Image source={require('@/assets/images/parcahan-emblem.png')} style={s.emblem} resizeMode="contain" accessibilityLabel="ParçaHan amblemi" /><View style={s.brandBlock}><Text numberOfLines={1} adjustsFontSizeToFit style={s.brand}><Text style={{color:navy}}>Parça</Text><Text style={{color:orange}}>Han</Text></Text><Text style={s.caption}>Yedek parçada doğru adres</Text></View></View>
    <TextInput placeholder="Ürün, marka veya araç ara" placeholderTextColor="#778196" style={s.search} />
    <View style={s.hero}><Text style={s.heroTitle}>Aradığın parça burada</Text><Text style={s.heroText}>İhtiyacın olan yedek parçayı keşfet.</Text><Pressable style={s.button}><Text style={s.buttonText}>Ürünleri keşfet  ›</Text></Pressable></View>
    <View style={s.row}><Text style={s.heading}>Kategoriler</Text><Text style={s.more}>Tümünü gör</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>{categories.map((x,i)=><View key={x} style={s.category}><Text style={s.catIcon}>{['⚙','◉','▤','ϟ','▱'][i]}</Text><Text style={s.catText}>{x}</Text></View>)}</ScrollView>
    <View style={s.row}><Text style={s.heading}>Öne çıkanlar</Text><Text style={s.more}>Tüm ürünler</Text></View>
    {products.map((x,i)=><View style={s.product} key={x}><View style={s.productImage}><Text style={{fontSize:30}}>{['◉','▤','⚙'][i]}</Text></View><View style={{flex:1}}><Text style={s.productName}>{x}</Text><Text style={s.muted}>Örnek ürün · {['Fren sistemi','Filtreler','Motor'][i]}</Text><Text style={s.price}>₺ 850,00</Text></View><Text style={s.heart}>♡</Text></View>)}
    <View style={s.sellers}><Text style={s.heading}>Satıcıları keşfet</Text><Text style={s.muted}>Güvenilir satıcılardan yedek parçaları incele.</Text></View>
    <Text style={s.note}>Örnek arayüz · Ürün bilgileri temsilidir.</Text>
  </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#F5F7FA'},page:{padding:18,paddingBottom:40,gap:14},header:{minHeight:70,paddingBottom:4,flexDirection:'row',alignItems:'center',gap:12},emblem:{width:88,height:66},brandBlock:{flex:1,minWidth:0,gap:2},brand:{fontSize:30,fontWeight:'900',color:navy,includeFontPadding:false},caption:{color:'#687386',fontSize:12,marginTop:2},search:{height:48,borderRadius:12,backgroundColor:'#fff',paddingHorizontal:15,borderWidth:1,borderColor:'#E4E8EF',fontSize:15},hero:{backgroundColor:navy,borderRadius:18,padding:20,gap:8},heroTitle:{color:'#fff',fontSize:22,fontWeight:'800'},heroText:{color:'#D7DEEA',fontSize:14},button:{alignSelf:'flex-start',backgroundColor:orange,borderRadius:10,paddingHorizontal:14,paddingVertical:10,marginTop:4},buttonText:{color:'#fff',fontWeight:'700'},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8},heading:{fontSize:18,fontWeight:'800',color:navy},more:{color:orange,fontWeight:'700',fontSize:13},categories:{gap:10,paddingVertical:3},category:{width:78,height:82,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderRadius:14,gap:6},catIcon:{fontSize:23,color:orange},catText:{fontSize:12,fontWeight:'600',color:navy},product:{flexDirection:'row',alignItems:'center',gap:12,padding:12,backgroundColor:'#fff',borderRadius:14},productImage:{width:62,height:62,borderRadius:12,backgroundColor:'#F0F2F6',alignItems:'center',justifyContent:'center'},productName:{fontSize:14,fontWeight:'700',color:navy},muted:{fontSize:12,color:'#778196',marginTop:4},price:{fontSize:14,fontWeight:'800',color:orange,marginTop:5},heart:{fontSize:24,color:navy},sellers:{backgroundColor:'#fff',padding:16,borderRadius:14,gap:6},note:{textAlign:'center',fontSize:11,color:'#8791A2'}});
