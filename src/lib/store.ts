import { create } from 'zustand';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  discount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addToCart: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
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
      items: quantity <= 0
        ? state.items.filter((item) => item.id !== productId)
        : state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
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
      0
    );
  },
}));

// Mock user store
interface UserStore {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isAuthenticated: false,
  user: null,
  
  login: (email, password) => {
    // Mock login - in real app this would call API
    if (email && password) {
      set({
        isAuthenticated: true,
        user: {
          name: 'Stephanus Sylvanus',
          email: email,
          phone: '+264815673978',
        },
      });
      return true;
    }
    return false;
  },
  
  signup: (name, email, password) => {
    // Mock signup
    if (name && email && password) {
      set({
        isAuthenticated: true,
        user: {
          name,
          email,
          phone: '',
        },
      });
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
