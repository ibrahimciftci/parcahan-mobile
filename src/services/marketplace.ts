import { ApiError, request } from './api';
export type Page<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean };
export type Photo = { id: number; url: string | null; displayOrder: number; primaryPhoto: boolean };
export type Offer = { id: number; catalogProductId: number; name: string; brand: string; category: string; price: number; stockQuantity: number; condition: string; active: boolean; legacyImageUrl: string | null; photos: Photo[]; sellerId: number; sellerName: string; sellerPhone: string; whatsappPhone: string | null; city: string; district: string; sellerLogo: string | null; offerDescription: string | null; description: string | null };
export type Compatibility = { vehicleBrand: string; vehicleModel: string; yearFrom?: number | null; yearTo?: number | null; engineInfo?: string | null; vehicleTypeIds?: number[]; vehicleBrandId?: number | null; vehicleModelId?: number | null };
export type Catalog = { id: number; name: string; description: string | null; category: string; brand: string; oemNumber: string | null; moderationStatus: string; active: boolean; offers: Offer[]; vehicleCompatibilities: Compatibility[] };
export type VehicleType = { id: number; name: string; code: string };
export type VehicleBrand = { id: number; name: string };
export type VehicleModel = { id: number; brandId: number; brandName: string; name: string };
export type PublicSeller = { id: number; storeName: string; city: string | null; district: string | null; description: string | null; logoUrl: string | null; offerCount: number };
export type SellerProfile = { id: number; storeName: string; phone: string; whatsappPhone: string | null; contactEmail: string | null; city: string | null; district: string | null; description: string | null; logoUrl: string | null; profileActive: boolean };
function normalizeCatalogPage(value: unknown): Page<Catalog> {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { content?: unknown }).content)) {
    throw new ApiError('Ürün listesi sunucudan beklenen biçimde alınamadı. Lütfen tekrar deneyin.');
  }
  const page = value as Partial<Page<Catalog>>;
  return {
    content: page.content as Catalog[],
    page: typeof page.page === 'number' ? page.page : 0,
    size: typeof page.size === 'number' ? page.size : (page.content as Catalog[]).length,
    totalElements: typeof page.totalElements === 'number' ? page.totalElements : (page.content as Catalog[]).length,
    totalPages: typeof page.totalPages === 'number' ? page.totalPages : 1,
    last: typeof page.last === 'boolean' ? page.last : true,
  };
}
export const marketplace = {
  catalog: async (params: Record<string, string | number>, page = 0) => { const query = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k,v])=>[k,String(v)])), page: String(page), size: '12' }); return normalizeCatalogPage(await request<unknown>(`/api/catalog/products?${query}`)); },
  detail: (id: number) => request<Catalog>(`/api/catalog/products/${id}`),
  sellers: async (page = 0) => request<Page<PublicSeller>>(`/api/sellers?page=${page}&size=20`),
  seller: (id: number) => request<SellerProfile>(`/api/sellers/${id}/profile`),
  sellerOffers: async (id: number, page = 0) => request<Page<Offer>>(`/api/sellers/${id}/offers?page=${page}&size=20`),
  categories: () => request<string[]>('/api/catalog/categories'), brands: () => request<string[]>('/api/catalog/brands'),
  vehicleTypes: () => request<VehicleType[]>('/api/vehicles/types'), vehicleBrands: (typeId?: number) => request<VehicleBrand[]>(`/api/vehicles/brands${typeId ? `?typeId=${typeId}` : ''}`),
  vehicleModels: (brandId: number, typeId?: number) => request<VehicleModel[]>(`/api/vehicles/brands/${brandId}/models${typeId ? `?typeId=${typeId}` : ''}`),
  favorites: () => request<Catalog[]>('/api/me/favorites'), favorite: (id: number) => request<null>(`/api/me/favorites/${id}`, { method: 'POST' }), unfavorite: (id: number) => request<null>(`/api/me/favorites/${id}`, { method: 'DELETE' }),
};
