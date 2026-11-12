import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Catalog, marketplace } from '@/services/marketplace';
import { assetUrl } from '@/services/api';

const s = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F5F7FA'},page:{padding:18,paddingBottom:40,gap:12},title:{fontSize:23,fontWeight:'800',color:'#101D35'},muted:{color:'#687386'},offer:{backgroundColor:'#fff',padding:14,borderRadius:14,gap:6},photo:{height:190,backgroundColor:'#EEF1F5',borderRadius:14},price:{fontSize:19,fontWeight:'800',color:'#F58220'},button:{backgroundColor:'#101D35',padding:11,borderRadius:9,color:'#fff',fontWeight:'700',overflow:'hidden',alignSelf:'flex-start'} });
export default function CatalogDetail(){
  const {id}=useLocalSearchParams<{id:string}>(); const [item,setItem]=useState<Catalog|null>(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(true);
  useEffect(()=>{marketplace.detail(Number(id)).then(setItem).catch(e=>setError(e.message)).finally(()=>setBusy(false))},[id]);
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page}>
    {busy?<ActivityIndicator/>:error?<Text style={s.muted}>{error}</Text>:item&&<>
      <Text style={s.title}>{item.name}</Text><Text style={s.muted}>{item.brand} · {item.category}{item.oemNumber?` · OEM ${item.oemNumber}`:''}</Text>
      {item.description?<Text style={s.muted}>{item.description}</Text>:null}<Text style={s.title}>Satıcı teklifleri</Text>
      {item.offers?.filter(o=>o.active).map(o=>{const image=o.photos?.find(p=>p.primaryPhoto)?.url||o.photos?.[0]?.url||o.legacyImageUrl;return <View key={o.id} style={s.offer}>
        {image?<Image source={{uri:assetUrl(image)||undefined}} style={s.photo}/>:<View style={s.photo}/>}
        <Text style={s.title}>{o.sellerName}</Text><Text style={s.muted}>{o.city}{o.district?` · ${o.district}`:''}</Text><Text style={s.price}>{o.price.toLocaleString('tr-TR')} ₺</Text>
        {o.stockQuantity>0?<Text style={s.muted}>Stokta</Text>:null}
        {o.sellerPhone?<Text onPress={()=>Linking.openURL(`tel:${o.sellerPhone}`)} style={s.button}>Telefonla ara</Text>:null}
        {o.whatsappPhone?<Text onPress={()=>{const phone=o.whatsappPhone;if(phone)void Linking.openURL(`https://wa.me/${phone.replace(/\D/g,'')}`)}} style={s.button}>WhatsApp</Text>:null}
      </View>})}
    </>}
  </ScrollView></SafeAreaView>;
}
