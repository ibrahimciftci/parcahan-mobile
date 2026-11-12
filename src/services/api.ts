import * as SecureStore from 'expo-secure-store';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const tokenKey = 'parcahan.jwt';
export class ApiError extends Error { constructor(message: string, readonly status?: number) { super(message); } }
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!baseUrl) throw new ApiError('API adresi ayarlanmamış. EXPO_PUBLIC_API_BASE_URL değerini tanımlayın.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const token = await SecureStore.getItemAsync(tokenKey);
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    const body = await response.json().catch(() => null) as { data?: T; message?: string } | null;
    if (!response.ok) {
      if (response.status === 401) await SecureStore.deleteItemAsync(tokenKey);
      throw new ApiError(body?.message || (response.status === 401 ? 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.' : 'İstek tamamlanamadı.'), response.status);
    }
    return body?.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error && error.name === 'AbortError' ? 'Bağlantı zaman aşımına uğradı.' : 'Sunucuya ulaşılamadı. Ağ bağlantınızı ve API adresini kontrol edin.');
  } finally { clearTimeout(timer); }
}
export const session = {
  tokenKey,
  save: (token: string) => SecureStore.setItemAsync(tokenKey, token),
  clear: () => SecureStore.deleteItemAsync(tokenKey),
  get: () => SecureStore.getItemAsync(tokenKey),
};
export const assetUrl = (url: string | null | undefined) => !url ? null : /^https?:\/\//i.test(url) ? url : baseUrl ? `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}` : null;
