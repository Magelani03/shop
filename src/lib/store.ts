import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_ORIGIN ?? "";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  discount?: number;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  role: "USER" | "ADMIN";
}

export interface Order {
  id: number;
  userId: number;
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== productId)
              : state.items.map((item) =>
                item.id === productId ? { ...item, quantity } : item,
              ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      isDrawerOpen: false,
      setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),
    }),
    {
      name: "cart-storage",
    },
  ),
);

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<boolean>;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
  isAdmin: () => boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      showAuthModal: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              token: data.token,
              user: data.user,
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      register: async (
        name: string,
        email: string,
        password: string,
        phone?: string,
      ) => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone?.trim() || undefined,
          }),
        });
        const text = await response.text();
        let data: { token?: string; user?: User; error?: string } = {};
        try {
          data = text ? (JSON.parse(text) as typeof data) : {};
        } catch {
          throw new Error(
            "Invalid response from server. Run the API in another terminal: npm run dev:server (default port 3000 must match Vite’s /api proxy).",
          );
        }
        if (response.ok && data.token && data.user) {
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
          });
          return true;
        }
        throw new Error(
          typeof data.error === "string" ? data.error : "Registration failed",
        );
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        useCartStore.getState().clearCart();
        useOrderStore.setState({ orders: [], currentOrder: null, loading: false });
      },

      setAuth: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "ADMIN";
      },

      setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),
    }),
    {
      name: "auth-storage",
      /**
       * Default persist merge is `{ ...current, ...persisted }`, so a late rehydration can overwrite
       * a brand-new login with stale localStorage. Prefer the in-memory session when tokens/users differ.
       */
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as Partial<AuthStore>;
        const c = currentState as AuthStore;
        const merged = { ...c, ...p };
        if (
          c.token &&
          c.user &&
          (p.token !== c.token || p.user?.id !== c.user?.id)
        ) {
          return {
            ...merged,
            token: c.token,
            user: c.user,
            isAuthenticated: !!c.isAuthenticated,
          };
        }
        return merged;
      },
    },
  ),
);

// API helper to get auth headers
export const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Order store for managing user orders
interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  fetchUserOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<Order | null>;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  fetchUserOrders: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;

    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/api/orders/my`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (response.ok) {
        const orders = await response.json();
        set({ orders });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (orderData) => {
    if (!useAuthStore.getState().isAuthenticated) return null;

    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrder: order,
        }));
        return order;
      }
      return null;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },
}));

// Settings store for app configuration
interface SettingsStore {
  settings: Record<string, string>;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {},
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      if (response.ok) {
        const settings = await response.json();
        set({ settings });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  getSetting: (key: string, defaultValue = "") => {
    const { settings } = get();
    return settings[key] || defaultValue;
  },
}));

// Admin store for admin panel functionality
interface AdminStore {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    pendingOrders: number;
    totalRevenue: number;
    recentOrders: any[];
  };
  products: Product[];
  orders: Order[];
  users: any[];
  loading: boolean;
  fetchStats: () => Promise<void>;
  fetchAdminProducts: (filters?: any) => Promise<void>;
  fetchAdminOrders: (filters?: any) => Promise<void>;
  fetchUsers: (filters?: any) => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<boolean>;
  generateWhatsApp: (orderId: number) => Promise<string | null>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stats: {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  },
  products: [],
  orders: [],
  users: [],
  loading: false,

  fetchStats: async () => {
    if (!useAuthStore.getState().isAdmin()) return;

    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const stats = await response.json();
        set({ stats });
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAdminProducts: async (filters = {}) => {
    if (!useAuthStore.getState().isAdmin()) return;

    set({ loading: true });
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/api/admin/products?${params}`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const products = await response.json();
        set({ products });
      }
    } catch (error) {
      console.error("Error fetching admin products:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAdminOrders: async (filters = {}) => {
    if (!useAuthStore.getState().isAdmin()) return;

    set({ loading: true });
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/api/admin/orders?${params}`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        set({ orders: data.orders });
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async (filters = {}) => {
    if (!useAuthStore.getState().isAdmin()) return;

    set({ loading: true });
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const users = await response.json();
        set({ users });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId: number, status: string) => {
    if (!useAuthStore.getState().isAdmin()) return false;

    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: status as any } : order
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  },

  generateWhatsApp: async (orderId: number) => {
    if (!useAuthStore.getState().isAdmin()) return null;

    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/whatsapp`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        return data.whatsappUrl;
      }
      return null;
    } catch (error) {
      console.error("Error generating WhatsApp link:", error);
      return null;
    }
  },
}));

// Backwards compatibility alias
export const useUserStore = useAuthStore;
