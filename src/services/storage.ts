import { Product, Order, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'products_global_dz_products_v2',
  ORDERS: 'products_global_dz_orders_v2',
  ADMIN_PIN: 'products_global_dz_admin_pin',
  ADMIN_SESSION: 'products_global_dz_admin_session',
  CART: 'products_global_dz_cart',
};

const DEFAULT_PIN = '1234';

// --- PRODUCTS REPOSITORY ---
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch (e) {
    console.error('Error reading products from storage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('products_updated'));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getStoredProducts();
  const newProduct: Product = {
    ...product,
    id: 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };
  const updated = [newProduct, ...products];
  saveStoredProducts(updated);
  return newProduct;
}

export function updateProduct(product: Product): void {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    saveStoredProducts([...products]);
  }
}

export function deleteProduct(productId: string): void {
  const products = getStoredProducts();
  const updated = products.filter((p) => p.id !== productId);
  saveStoredProducts(updated);
}

export function resetProducts(): Product[] {
  saveStoredProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

// --- ORDERS REPOSITORY ---
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading orders from storage:', e);
    return [];
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('orders_updated'));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
}

export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
  const orders = getStoredOrders();
  const newOrder: Order = {
    ...orderData,
    id: 'CMD-' + (orders.length + 1).toString().padStart(4, '0') + '-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const updated = [newOrder, ...orders];
  saveStoredOrders(updated);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getStoredOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveStoredOrders([...orders]);
  }
}

export function deleteOrder(orderId: string): void {
  const orders = getStoredOrders();
  const updated = orders.filter((o) => o.id !== orderId);
  saveStoredOrders(updated);
}

// --- ADMIN AUTHENTICATION ---
export function getAdminPin(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || DEFAULT_PIN;
}

export function setAdminPin(newPin: string): boolean {
  if (!newPin || newPin.trim().length < 4) return false;
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin.trim());
  return true;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getAdminPin();
  if (enteredPin.trim() === currentPin) {
    // Set 8-hour session token
    const expiry = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({ token: 'auth-dz-admin', expiry }));
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (session && session.expiry && session.expiry > Date.now()) {
      return true;
    }
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    return false;
  } catch {
    return false;
  }
}

export function logoutAdmin(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

// --- BACKUP & RESTORE FOR OWNER (MOBILE FRIENDLY) ---
export function exportCatalogJson(): string {
  const products = getStoredProducts();
  return JSON.stringify(products, null, 2);
}

export function importCatalogJson(jsonString: string): { success: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, error: 'Le fichier ne contient aucun produit valide.' };
    }
    // Basic validation
    const valid = parsed.every((p) => p.name && typeof p.price === 'number');
    if (!valid) {
      return { success: false, error: 'Structure de produit invalide. Chaque produit doit avoir un nom et un prix.' };
    }
    saveStoredProducts(parsed);
    return { success: true, count: parsed.length };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur d\'analyse JSON' };
  }
}
