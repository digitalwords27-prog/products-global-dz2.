import { Product, Order, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'products_global_dz_products_v2',
  ORDERS: 'products_global_dz_orders_v2',
  ADMIN_PIN: 'products_global_dz_admin_pin',
  ADMIN_SESSION: 'products_global_dz_admin_session',
  CART: 'products_global_dz_cart',
};

const DEFAULT_PIN = '1234';

function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

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

  // Sync to Cloud Firestore in background
  const path = `products/${newProduct.id}`;
  setDoc(doc(db, 'products', newProduct.id), cleanForFirestore(newProduct)).catch((err) => {
    handleFirestoreError(err, OperationType.CREATE, path);
  });

  return newProduct;
}

export function updateProduct(product: Product): void {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    saveStoredProducts([...products]);

    // Sync to Cloud Firestore in background
    const path = `products/${product.id}`;
    setDoc(doc(db, 'products', product.id), cleanForFirestore(product)).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, path);
    });
  }
}

export function deleteProduct(productId: string): void {
  const products = getStoredProducts();
  const updated = products.filter((p) => p.id !== productId);
  saveStoredProducts(updated);

  // Sync to Cloud Firestore in background
  const path = `products/${productId}`;
  deleteDoc(doc(db, 'products', productId)).catch((err) => {
    handleFirestoreError(err, OperationType.DELETE, path);
  });
}

export function resetProducts(): Product[] {
  saveStoredProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

// Global Cloud Sync Listener for Products
let isProductsSyncInitialized = false;
export function initProductsSync(): () => void {
  if (isProductsSyncInitialized) return () => {};
  isProductsSyncInitialized = true;

  const productsCol = collection(db, 'products');

  const unsubscribe = onSnapshot(
    productsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // First run on empty cloud database: Seed INITIAL_PRODUCTS to Firestore
        try {
          const batch = writeBatch(db);
          INITIAL_PRODUCTS.forEach((p) => {
            const ref = doc(db, 'products', p.id);
            batch.set(ref, cleanForFirestore(p));
          });
          await batch.commit();
        } catch (e) {
          console.warn('Initial seeding of products in Firestore:', e);
        }
      } else {
        const cloudProducts: Product[] = [];
        snapshot.forEach((d) => {
          cloudProducts.push(d.data() as Product);
        });

        if (cloudProducts.length > 0) {
          // Sort or preserve order
          saveStoredProducts(cloudProducts);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  );

  return unsubscribe;
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

  // Sync to Cloud Firestore in background
  const path = `orders/${newOrder.id}`;
  setDoc(doc(db, 'orders', newOrder.id), cleanForFirestore(newOrder)).catch((err) => {
    handleFirestoreError(err, OperationType.CREATE, path);
  });

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getStoredOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveStoredOrders([...orders]);

    // Sync to Cloud Firestore in background
    const path = `orders/${orderId}`;
    setDoc(doc(db, 'orders', orderId), cleanForFirestore(order)).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, path);
    });
  }
}

export function deleteOrder(orderId: string): void {
  const orders = getStoredOrders();
  const updated = orders.filter((o) => o.id !== orderId);
  saveStoredOrders(updated);

  // Sync to Cloud Firestore in background
  const path = `orders/${orderId}`;
  deleteDoc(doc(db, 'orders', orderId)).catch((err) => {
    handleFirestoreError(err, OperationType.DELETE, path);
  });
}

// Global Cloud Sync Listener for Orders
let isOrdersSyncInitialized = false;
export function initOrdersSync(): () => void {
  if (isOrdersSyncInitialized) return () => {};
  isOrdersSyncInitialized = true;

  const ordersCol = collection(db, 'orders');

  const unsubscribe = onSnapshot(
    ordersCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const cloudOrders: Order[] = [];
        snapshot.forEach((d) => {
          cloudOrders.push(d.data() as Order);
        });
        cloudOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveStoredOrders(cloudOrders);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );

  return unsubscribe;
}

// --- ADMIN AUTHENTICATION & ADVANCED SECURITY ---
const SECURITY_KEYS = {
  CONFIG: 'products_global_dz_security_cfg_v1',
  AUTH_ATTEMPTS: 'products_global_dz_auth_attempts_v1',
  SITE_UNLOCKED_SESSION: 'products_global_dz_site_unlocked_session_v1',
};

export function getSecurityConfig(): import('../types').SecurityConfig {
  try {
    const raw = localStorage.getItem(SECURITY_KEYS.CONFIG);
    if (!raw) {
      return {
        stealthMode: false,
        siteLockEnabled: false,
        rememberDevice: true,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      stealthMode: Boolean(parsed.stealthMode),
      siteLockEnabled: Boolean(parsed.siteLockEnabled),
      rememberDevice: parsed.rememberDevice !== false,
    };
  } catch {
    return {
      stealthMode: false,
      siteLockEnabled: false,
      rememberDevice: true,
    };
  }
}

export function saveSecurityConfig(cfg: Partial<import('../types').SecurityConfig>): import('../types').SecurityConfig {
  const current = getSecurityConfig();
  const updated = { ...current, ...cfg };
  try {
    localStorage.setItem(SECURITY_KEYS.CONFIG, JSON.stringify(updated));
    window.dispatchEvent(new Event('security_updated'));
  } catch (e) {
    console.error('Error saving security config:', e);
  }
  return updated;
}

export function getAdminPin(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || DEFAULT_PIN;
}

export function isDefaultPinInUse(): boolean {
  return getAdminPin() === DEFAULT_PIN;
}

export function setAdminPin(newPin: string): boolean {
  if (!newPin || newPin.trim().length < 4) return false;
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin.trim());
  // Also clear any lockout state on password update
  resetAuthAttempts();
  return true;
}

export function getAuthAttemptState(): import('../types').AuthAttemptState {
  try {
    const raw = localStorage.getItem(SECURITY_KEYS.AUTH_ATTEMPTS);
    if (!raw) return { failedAttempts: 0, lockoutUntil: null };
    const parsed = JSON.parse(raw);
    return {
      failedAttempts: typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : null,
    };
  } catch {
    return { failedAttempts: 0, lockoutUntil: null };
  }
}

export function getRemainingLockoutSeconds(): number {
  const state = getAuthAttemptState();
  if (!state.lockoutUntil) return 0;
  const diff = state.lockoutUntil - Date.now();
  if (diff <= 0) {
    // Lockout expired, reset attempts
    resetAuthAttempts();
    return 0;
  }
  return Math.ceil(diff / 1000);
}

export function resetAuthAttempts(): void {
  try {
    localStorage.removeItem(SECURITY_KEYS.AUTH_ATTEMPTS);
  } catch (e) {
    console.error('Error resetting attempts:', e);
  }
}

function recordFailedAttempt(): { locked: boolean; remainingSeconds: number; attemptsLeft: number } {
  const state = getAuthAttemptState();
  const newAttempts = state.failedAttempts + 1;
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

  if (newAttempts >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_MS;
    localStorage.setItem(SECURITY_KEYS.AUTH_ATTEMPTS, JSON.stringify({
      failedAttempts: newAttempts,
      lockoutUntil,
    }));
    return {
      locked: true,
      remainingSeconds: Math.ceil(LOCKOUT_MS / 1000),
      attemptsLeft: 0,
    };
  }

  localStorage.setItem(SECURITY_KEYS.AUTH_ATTEMPTS, JSON.stringify({
    failedAttempts: newAttempts,
    lockoutUntil: null,
  }));
  return {
    locked: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_ATTEMPTS - newAttempts,
  };
}

export interface VerifyAuthResult {
  success: boolean;
  locked?: boolean;
  remainingSeconds?: number;
  attemptsLeft?: number;
  message?: string;
}

export function verifyAdminPinWithProtection(enteredPin: string, rememberDevice = true): VerifyAuthResult {
  const remainingLock = getRemainingLockoutSeconds();
  if (remainingLock > 0) {
    return {
      success: false,
      locked: true,
      remainingSeconds: remainingLock,
      attemptsLeft: 0,
    };
  }

  const currentPin = getAdminPin();
  if (enteredPin && enteredPin.trim() === currentPin) {
    resetAuthAttempts();
    // Expiry: 30 days if rememberDevice, or 8 hours
    const duration = rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
    const expiry = Date.now() + duration;
    localStorage.setItem(
      STORAGE_KEYS.ADMIN_SESSION, 
      JSON.stringify({ 
        token: 'auth-dz-admin-' + Math.random().toString(36).substring(2),
        expiry,
        trustedDevice: rememberDevice 
      })
    );
    // When admin logs in, also auto-unlock site if site lock is on
    unlockSiteSession();
    window.dispatchEvent(new Event('admin_auth_changed'));
    return { success: true };
  }

  // Failed
  const failResult = recordFailedAttempt();
  return {
    success: false,
    locked: failResult.locked,
    remainingSeconds: failResult.remainingSeconds,
    attemptsLeft: failResult.attemptsLeft,
  };
}

// Legacy helper for compatibility
export function verifyAdminPin(enteredPin: string): boolean {
  return verifyAdminPinWithProtection(enteredPin).success;
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
  window.dispatchEvent(new Event('admin_auth_changed'));
}

export function revokeAllSessions(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  localStorage.removeItem(SECURITY_KEYS.SITE_UNLOCKED_SESSION);
  window.dispatchEvent(new Event('admin_auth_changed'));
  window.dispatchEvent(new Event('security_updated'));
}

// --- SITE-WIDE LOCK (PRIVATE STORE MODE) ---
export function isSiteUnlocked(): boolean {
  const config = getSecurityConfig();
  if (!config.siteLockEnabled) return true;
  if (isAdminAuthenticated()) return true;

  try {
    const session = sessionStorage.getItem(SECURITY_KEYS.SITE_UNLOCKED_SESSION) ||
                    localStorage.getItem(SECURITY_KEYS.SITE_UNLOCKED_SESSION);
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed && parsed.expiry && parsed.expiry > Date.now()) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export function unlockSiteSession(): void {
  try {
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const payload = JSON.stringify({ unlocked: true, expiry });
    sessionStorage.setItem(SECURITY_KEYS.SITE_UNLOCKED_SESSION, payload);
    localStorage.setItem(SECURITY_KEYS.SITE_UNLOCKED_SESSION, payload);
    window.dispatchEvent(new Event('security_updated'));
  } catch (e) {
    console.error('Error unlocking site session:', e);
  }
}

export function verifySiteLockKey(enteredKey: string): VerifyAuthResult {
  const remainingLock = getRemainingLockoutSeconds();
  if (remainingLock > 0) {
    return {
      success: false,
      locked: true,
      remainingSeconds: remainingLock,
      attemptsLeft: 0,
    };
  }

  const currentPin = getAdminPin();
  if (enteredKey && enteredKey.trim() === currentPin) {
    resetAuthAttempts();
    unlockSiteSession();
    return { success: true };
  }

  const failResult = recordFailedAttempt();
  return {
    success: false,
    locked: failResult.locked,
    remainingSeconds: failResult.remainingSeconds,
    attemptsLeft: failResult.attemptsLeft,
  };
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
