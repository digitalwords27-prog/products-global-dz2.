export type Language = 'fr' | 'ar' | 'en';

export type CategoryId = 
  | 'all'
  | 'perfumes' 
  | 'cosmetics' 
  | 'skincare' 
  | 'beauty-accessories' 
  | 'fashion-accessories' 
  | 'watches-men' 
  | 'watches-women';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number; // in DZD
  originalPrice?: number; // in DZD, for discount badge
  category: CategoryId;
  image: string;
  secondaryImages?: string[];
  inStock: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isSpecialOffer?: boolean;
  volumeOrSize?: string;
  gender?: 'unisex' | 'men' | 'women';
  rating?: number;
  salesCount?: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemSummary {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'desk';
  items: OrderItemSummary[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  deskDeliveryFee: number;
  homeDeliveryFee: number;
  deliveryTimeDays: string;
}

export interface SecurityConfig {
  stealthMode: boolean; // hide admin button from public header/footer
  siteLockEnabled: boolean; // lock entire site behind master password
  rememberDevice: boolean; // keep session active on trusted device
}

export interface AuthAttemptState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

