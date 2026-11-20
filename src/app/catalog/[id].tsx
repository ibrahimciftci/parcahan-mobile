import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Catalog, marketplace } from '@/services/marketplace';
import { assetUrl } from '@/services/api';

const s = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F5F7FB'},page:{padding:18,paddingBottom:40,gap:12},title:{fontSize:23,fontWeight:'800',color:'#101D35'},muted:{color:'#667085'},offer:{backgroundColor:'#fff',padding:14,borderRadius:14,borderWidth:1,borderColor:'#D8DFEA',gap:7},photo:{height:190,backgroundColor:'#EEF1F5',borderRadius:14},price:{fontSize:19,fontWeight:'800',color:'#F58220'},button:{backgroundColor:'#101D35',padding:11,borderRadius:9,color:'#fff',fontWeight:'700',overflow:'hidden',alignSelf:'flex-start'},section:{fontSize:18,fontWeight:'800',color:'#101D35',marginTop:8},error:{color:'#EF4444',textAlign:'center',padding:20},chip:{color:'#101D35',backgroundColor:'#F0F3F8',padding:8,borderRadius:8,overflow:'hidden'} });
export default function CatalogDetail(){
  const {id}=useLocalSearchParams<{id:string}>(); const productId=Number(id); const [item,setItem]=useState<Catalog|null>(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(true);
  useEffect(()=>{let active=true;setBusy(true);setItem(null);setError('');if(!Number.isSafeInteger(productId)||productId<1){setError('Ürün bulunamadı.');setBusy(false);return()=>{active=false}}marketplace.detail(productId).then(result=>{if(active)setItem(result)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Ürün yüklenemedi.')}).finally(()=>{if(active)setBusy(false)});return()=>{active=false}},[productId]);
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page}>
    {busy?<ActivityIndicator color="#F58220"/>:error?<Text style={s.error}>{error}</Text>:item&&<>
      {(()=>{const firstOffer=[...item.offers].sort((a,b)=>a.price-b.price)[0];const image=firstOffer?.photos?.find(p=>p.primaryPhoto)?.url||firstOffer?.photos?.[0]?.url||firstOffer?.legacyImageUrl;return image?<Image source={{uri:assetUrl(image)||undefined}} style={s.photo} resizeMode="cover"/>:null})()}
      <Text style={s.title}>{item.name}</Text><Text style={s.muted}>{item.brand} · {item.category}{item.oemNumber?` · OEM ${item.oemNumber}`:''}</Text>
      {item.description?<Text style={s.muted}>{item.description}</Text>:null}
      {item.vehicleCompatibilities?.length ? <><Text style={s.section}>Araç Uyumluluğu</Text>{item.vehicleCompatibilities.map((fit,index)=><Text key={`${fit.vehicleBrand}-${fit.vehicleModel}-${index}`} style={s.chip}>{fit.vehicleBrand} {fit.vehicleModel}{fit.yearFrom||fit.yearTo?` · ${fit.yearFrom||'…'}–${fit.yearTo||'…'}`:''}{fit.engineInfo?` · ${fit.engineInfo}`:''}</Text>)}</>:null}
      <Text style={s.section}>Satıcı Teklifleri</Text>{[...item.offers].filter(o=>o.active).sort((a,b)=>a.price-b.price).map(o=>{const image=o.photos?.find(p=>p.primaryPhoto)?.url||o.photos?.[0]?.url||o.legacyImageUrl;return <View key={o.id} style={s.offer}>
        {image?<Image source={{uri:assetUrl(image)||undefined}} style={s.photo} resizeMode="cover"/>:<View style={s.photo}/>}
        <Pressable accessibilityRole="link" onPress={()=>router.push({pathname:'/seller/[id]',params:{id:String(o.sellerId)}})}><Text style={s.title}>{o.sellerName}</Text></Pressable><Text style={s.muted}>{[o.city,o.district].filter(Boolean).join(' · ')}</Text><Text style={s.price}>{o.price.toLocaleString('tr-TR')} ₺</Text>
        <Text style={s.muted}>Durum: {o.condition==='NEW'?'Yeni':'Kullanılmış'} · {o.stockQuantity>0?`Stokta (${o.stockQuantity})`:'Stokta yok'}</Text>{o.offerDescription?<Text style={s.muted}>{o.offerDescription}</Text>:null}
        {o.sellerPhone?<Text onPress={()=>void Linking.openURL(`tel:${o.sellerPhone}`)} style={s.button}>Telefonla ara</Text>:null}
        {o.whatsappPhone?<Text onPress={()=>{const phone=o.whatsappPhone;if(phone)void Linking.openURL(`https://wa.me/${phone.replace(/\D/g,'')}`)}} style={s.button}>WhatsApp</Text>:null}
      </View>})}{item.offers.filter(o=>o.active).length===0?<Text style={s.muted}>Bu ürün için şu anda yayında teklif yok.</Text>:null}
    </>}
  </ScrollView></SafeAreaView>;
}
