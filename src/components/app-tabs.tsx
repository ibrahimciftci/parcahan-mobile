import { NativeTabs } from 'expo-router/native-tabs';

export default function AppTabs() {
  return <NativeTabs backgroundColor="#FFFFFF" blurEffect="none" shadowColor="#E5E9EF" tintColor="#F58220" iconColor={{ default: '#687386', selected: '#F58220' }} labelStyle={{ default: { color: '#687386' }, selected: { color: '#F58220' } }} indicatorColor="#F58220">
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>Ana Sayfa</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="house.fill" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="products"><NativeTabs.Trigger.Label>Ürünler</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="favorites"><NativeTabs.Trigger.Label>Favoriler</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="heart.fill" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="account"><NativeTabs.Trigger.Label>Hesabım</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="person.fill" /></NativeTabs.Trigger>
  </NativeTabs>;
}
