import {useState} from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '@/context/session';
import {ApiError, request} from '@/services/api';

const s = StyleSheet.create({
    safe: {flex: 1, backgroundColor: '#F5F7FB'},
    page: {padding: 20, paddingBottom: 32, gap: 16},
    title: {fontSize: 25, fontWeight: '800', color: '#101D35'},
    input: {
        backgroundColor: '#fff',
        color: '#101D35',
        padding: 13,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D8DFEA'
    },
    button: {
        backgroundColor: '#F58220',
        minHeight: 50,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {color: '#fff', fontWeight: '800'},
    outline: {padding: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#101D35'},
    muted: {color: '#667085'},
    error: {color: '#EF4444'},
    intro: {alignItems: 'center', gap: 8, paddingVertical: 4},
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E9EEF6',
        alignItems: 'center',
        justifyContent: 'center'
    },
    welcome: {fontSize: 21, fontWeight: '800', color: '#101D35'},
    description: {fontSize: 14, lineHeight: 21, color: '#667085', textAlign: 'center'},
    card: {backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EDF0F5', padding: 16, gap: 14},
    tabs: {flexDirection: 'row', backgroundColor: '#F0F3F8', padding: 4, borderRadius: 12},
    tab: {flex: 1, minHeight: 42, borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
    tabSelected: {backgroundColor: '#101D35'},
    tabText: {color: '#101D35', fontWeight: '700'},
    tabTextSelected: {color: '#fff'},
    field: {gap: 6},
    label: {color: '#101D35', fontWeight: '700'},
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#D8DFEA',
        backgroundColor: '#fff',
        borderRadius: 11
    },
    fieldInput: {flex: 1, minHeight: 48, paddingVertical: 10, color: '#101D35'},
    fieldIcon: {color: '#667085', fontSize: 17},
    linkRow: {flexDirection: 'row', justifyContent: 'center', gap: 4},
    link: {color: '#101D35', fontWeight: '800'},
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D8DFEA',
        padding: 18,
        gap: 12
    },
    profileTop: {flexDirection: 'row', alignItems: 'center', gap: 12},
    profileAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#E9EEF6',
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileName: {fontSize: 18, fontWeight: '800', color: '#101D35', flexShrink: 1},
    profileEmail: {color: '#667085', flexShrink: 1},
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F3F8',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    roleText: {fontSize: 12, color: '#101D35', fontWeight: '700'},
    sectionTitle: {fontSize: 17, fontWeight: '800', color: '#101D35'},
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#EDF0F5'
    },
    infoIcon: {width: 28, color: '#F58220', textAlign: 'center', fontSize: 17},
    infoCopy: {flex: 1, gap: 3},
    infoLabel: {fontSize: 12, color: '#667085'},
    infoValue: {color: '#101D35', fontWeight: '600', flexShrink: 1},
    actionRow: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D8DFEA',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    actionLabel: {flex: 1, color: '#101D35', fontWeight: '700'},
    dangerRow: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#FECACA',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    dangerText: {color: '#EF4444', fontWeight: '700'},
    editButtonRow: {flexDirection: 'row', gap: 10},
    saveButton: {flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center'},
    cancelButton: {flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center'},
    editButtonText: {color: '#fff', fontWeight: '800'},
    cancel: {padding: 12, alignItems: 'center'},
    cancelText: {color: '#667085', fontWeight: '700'}
});
export default function Account() {
    const {user, ready, login, register, logout, message, setMessage, refresh} = useSession();
    const [mode, setMode] = useState<'login' | 'register'>('login'), [first, setFirst] = useState(''), [last, setLast] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [editing, setEditing] = useState(false), [application, setApplication] = useState('');
    if (!ready) return <SafeAreaView style={s.safe}><ActivityIndicator/></SafeAreaView>;
    const submit = async () => {
        setBusy(true);
        setError('');
        try {
            if (mode === 'login') await login(email, password); else await register(first, last, email, password);
            setPassword('')
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'İşlem tamamlanamadı.')
        } finally {
            setBusy(false)
        }
    };
    const applyUpdate = async () => {
        if (!first.trim() || !last.trim()) {
            setError('Ad ve soyad alanları boş bırakılamaz.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await request('/api/users/me', {
                method: 'PUT',
                body: JSON.stringify({firstName: first || user?.firstName, lastName: last || user?.lastName})
            });
            await refresh();
            setEditing(false)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setBusy(false)
        }
    };
    const sellerStatus = async () => {
        try {
            const result = await request<{ status: string; storeName: string }>('/api/sellers/me');
            setApplication(`${result.storeName}: ${result.status}`)
        } catch (e) {
            const x = e as ApiError;
            setApplication(x.status === 404 ? 'Satıcı başvurusu bulunamadı.' : x.message)
        }
    };
    return <SafeAreaView style={s.safe} edges={['top']}><KeyboardAvoidingView style={{flex: 1}}
                                                                              behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView
        contentContainerStyle={s.page} keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}><Text
        style={s.title}>Hesabım</Text>{message ? <Text style={s.error}>{message}</Text> : null}{error ?
        <Text style={s.error}>{error}</Text> : null}{!user &&
        <View style={s.intro}><View style={s.avatar}><Text style={s.fieldIcon}>♙</Text></View><Text style={s.welcome}>ParçaHan'a
            Hoş Geldiniz</Text><Text style={s.description}>Hesabınıza giriş yaparak favorilerinize ve profilinize
            ulaşın.</Text></View>}{user ? <>
        <View style={s.profileCard}><View style={s.profileTop}><View style={s.profileAvatar}><Text style={s.fieldIcon}>♙</Text></View><View style={s.infoCopy}><Text style={s.profileName}>{user.firstName} {user.lastName}</Text><Text style={s.profileEmail} numberOfLines={2}>{user.email}</Text></View></View><View style={s.roleBadge}><Text style={s.roleText}>{user.role === 'CUSTOMER' ? 'Müşteri' : user.role === 'SELLER' ? 'Satıcı' : 'Yönetici'}</Text></View></View><View style={s.profileCard}><Text style={s.sectionTitle}>Hesap Bilgilerim</Text><View style={s.infoRow}><Text style={s.infoIcon}>●</Text><View style={s.infoCopy}><Text style={s.infoLabel}>Ad Soyad</Text><Text style={s.infoValue}>{user.firstName} {user.lastName}</Text></View></View><View style={s.infoRow}><Text style={s.infoIcon}>@</Text><View style={s.infoCopy}><Text style={s.infoLabel}>E-posta</Text><Text style={s.infoValue}>{user.email}</Text></View></View><View style={s.infoRow}><Text style={s.infoIcon}>▣</Text><View style={s.infoCopy}><Text style={s.infoLabel}>Hesap Türü</Text><Text style={s.infoValue}>{user.role === 'CUSTOMER' ? 'Müşteri' : user.role === 'SELLER' ? 'Satıcı' : 'Yönetici'}</Text></View></View></View>{editing ? <View style={s.profileCard}><Text style={s.sectionTitle}>Profili Düzenle</Text><Text style={s.infoLabel}>Adınızı ve soyadınızı güncelleyebilirsiniz.</Text><TextInput style={s.input} placeholder="Ad" value={first}
                                                                        onChangeText={setFirst}/><TextInput
        style={s.input} placeholder="Soyad" value={last} onChangeText={setLast}/><View style={s.editButtonRow}><Pressable style={s.saveButton} disabled={busy} accessibilityRole="button" accessibilityLabel="Değişiklikleri Kaydet" onPress={() => void applyUpdate()}><Text style={s.editButtonText}>✓  Kaydet</Text></Pressable><Pressable style={s.cancelButton} disabled={busy} accessibilityRole="button" accessibilityLabel="Vazgeç" onPress={() => {setFirst(user.firstName);setLast(user.lastName);setError('');setEditing(false)}}><Text style={s.editButtonText}>×  Vazgeç</Text></Pressable></View></View> : <Pressable style={s.actionRow} accessibilityRole="button" accessibilityLabel="Profili Düzenle" onPress={() => {
        setFirst(user.firstName);
        setLast(user.lastName);
        setEditing(true)
    }}><Text style={s.fieldIcon}>✎</Text><Text style={s.actionLabel}>Profili Düzenle</Text><Text style={s.fieldIcon}>›</Text></Pressable>}{user.role === 'SELLER' && <><Pressable style={s.outline}
                                                                                        onPress={() => void sellerStatus()}><Text>Satıcı
        başvuru durumunu görüntüle</Text></Pressable>{application ?
        <Text style={s.muted}>{application}</Text> : null}<Text style={s.muted}>Satıcı yönetim ekranı mobilde henüz
        mevcut değil.</Text></>}<Pressable style={s.button} onPress={() => void logout()}><Text style={s.buttonText}>Güvenli
        Çıkış Yap</Text></Pressable></> : <><View style={s.tabs} accessibilityRole="tablist"><Pressable
        accessibilityRole="tab" accessibilityState={{selected: mode === 'login'}}
        style={[s.tab, mode === 'login' && s.tabSelected]} onPress={() => setMode('login')}><Text
        style={[s.tabText, mode === 'login' && s.tabTextSelected]}>Giriş Yap</Text></Pressable><Pressable
        accessibilityRole="tab" accessibilityState={{selected: mode === 'register'}}
        style={[s.tab, mode === 'register' && s.tabSelected]} onPress={() => setMode('register')}><Text
        style={[s.tabText, mode === 'register' && s.tabTextSelected]}>Üye
        Ol</Text></Pressable></View>{mode === 'register' && <><View style={s.field}><Text style={s.label}>Ad</Text><View
        style={s.inputRow}><Text style={s.fieldIcon}>●</Text><TextInput style={s.fieldInput} placeholder="Adınızı girin"
                                                                        placeholderTextColor="#7B8494" value={first}
                                                                        onChangeText={setFirst} autoCapitalize="words"
                                                                        autoComplete="given-name"
                                                                        textContentType="givenName"/></View></View><View
        style={s.field}><Text style={s.label}>Soyad</Text><View style={s.inputRow}><Text
        style={s.fieldIcon}>●</Text><TextInput style={s.fieldInput} placeholder="Soyadınızı girin"
                                               placeholderTextColor="#7B8494" value={last} onChangeText={setLast}
                                               autoCapitalize="words" autoComplete="family-name"
                                               textContentType="familyName"/></View></View></>}<View
        style={s.field}><Text style={s.label}>E-posta adresi</Text><View style={s.inputRow}><Text
        style={s.fieldIcon}>@</Text><TextInput style={s.fieldInput}
                                               placeholder="ornek@eposta.com"
                                               placeholderTextColor="#7B8494"
                                               autoCapitalize="none"
                                               autoComplete="email"
                                               keyboardType="email-address"
                                               value={email}
                                               onChangeText={setEmail}/></View></View><View style={s.field}><Text
        style={s.label}>Şifre</Text><View style={s.inputRow}><Text style={s.fieldIcon}>*</Text><TextInput
        style={s.fieldInput} placeholder="Şifrenizi girin" placeholderTextColor="#7B8494" secureTextEntry
        value={password} onChangeText={setPassword}/></View></View><Pressable
        disabled={busy} style={s.button} onPress={() => void submit()}><Text
        style={s.buttonText}>{busy ? 'Bekleyin…' : mode === 'login' ? 'Giriş Yap' : 'Üye Ol'}</Text></Pressable></>}
    </ScrollView></KeyboardAvoidingView></SafeAreaView>
}
