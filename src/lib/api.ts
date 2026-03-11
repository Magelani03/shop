import type { Product, Order, User } from "@/lib/store";

/** In production, set VITE_API_ORIGIN to your Worker URL (e.g. https://shop-api.xxx.workers.dev) so the frontend calls the right API. */
const API_BASE = import.meta.env.VITE_API_ORIGIN ?? "";

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number | string;
  rating: number;
  image: string;
  category: string;
  discount: number | null;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDto {
  id: number;
  userId: number;
  status: string;
  total: number | string;
  subtotal: number | string;
  tax: number | string;
  shipping: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems: any[];
}

function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    // Prisma Decimal comes through JSON as string, normalise to number
    price: typeof dto.price === "string" ? parseFloat(dto.price) : dto.price,
    rating: dto.rating,
    image: dto.image,
    category: dto.category,
    discount: dto.discount ?? undefined,
    stock: dto.stock,
    featured: dto.featured,
    active: dto.active,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    userId: dto.userId,
    status: dto.status as any,
    total: typeof dto.total === "string" ? parseFloat(dto.total) : dto.total,
    subtotal:
      typeof dto.subtotal === "string"
        ? parseFloat(dto.subtotal)
        : dto.subtotal,
    tax: typeof dto.tax === "string" ? parseFloat(dto.tax) : dto.tax,
    shipping:
      typeof dto.shipping === "string"
        ? parseFloat(dto.shipping)
        : dto.shipping,
    customerName: dto.customerName,
    customerEmail: dto.customerEmail,
    customerPhone: dto.customerPhone,
    shippingAddress: dto.shippingAddress,
    notes: dto.notes,
    whatsappSent: dto.whatsappSent,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    orderItems: dto.orderItems || [],
  };
}

// Product API functions
export async function getProducts(params?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.append("category", params.category);
  if (params?.featured) searchParams.append("featured", "true");
  if (params?.search) searchParams.append("search", params.search);
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.offset) searchParams.append("offset", params.offset.toString());

  const res = await fetch(`${API_BASE}/api/products?${searchParams}`);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = (await res.json()) as ProductDto[];
  return data.map(mapProduct);
}

export async function getProduct(id: number): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }
  const data = (await res.json()) as ProductDto;
  return mapProduct(data);
}

// Auth API functions
export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User } | null> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
  phone?: string,
): Promise<{ token: string; user: User } | null> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

export async function updateProfile(
  profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
    address?: string;
    city?: string;
  },
  authHeaders: Record<string, string>,
): Promise<User | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { user: User };
  return data.user;
}

// Order API functions
export async function createOrder(
  orderData: {
    items: Array<{ productId: number; quantity: number }>;
    customerInfo: {
      name?: string;
      email?: string;
      phone?: string;
    };
    shippingAddress: string;
    notes?: string;
  },
  authHeaders: Record<string, string>,
): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return mapOrder(data);
}

export async function getOrderWhatsAppUrl(
  id: number,
  authHeaders: Record<string, string>,
): Promise<{ whatsappUrl: string; message: string } | null> {
  const res = await fetch(`${API_BASE}/api/orders/${id}/whatsapp`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

export async function getUserOrders(
  authHeaders: Record<string, string>,
): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders/my`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = (await res.json()) as OrderDto[];
  return data.map(mapOrder);
}

// Settings API functions
export async function getSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) {
    throw new Error("Failed to fetch settings");
  }
  return await res.json();
}

// Admin API functions
export async function getAdminStats(
  authHeaders: Record<string, string>,
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return await res.json();
}

export async function getAdminProducts(
  params: Record<string, string> = {},
  authHeaders: Record<string, string>,
): Promise<Product[]> {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/admin/products?${searchParams}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin products");
  }

  const data = (await res.json()) as ProductDto[];
  return data.map(mapProduct);
}

export async function createProduct(
  productData: Partial<Product>,
  authHeaders: Record<string, string>,
): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as ProductDto;
  return mapProduct(data);
}

export async function updateProduct(
  id: number,
  productData: Partial<Product>,
  authHeaders: Record<string, string>,
): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as ProductDto;
  return mapProduct(data);
}

export async function deleteProduct(
  id: number,
  authHeaders: Record<string, string>,
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  return res.ok;
}

export async function getAdminOrders(
  params: Record<string, string> = {},
  authHeaders: Record<string, string>,
): Promise<{
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/admin/orders?${searchParams}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin orders");
  }

  const data = await res.json();
  return {
    ...data,
    orders: data.orders.map(mapOrder),
  };
}

export async function updateOrderStatus(
  id: number,
  status: string,
  authHeaders: Record<string, string>,
): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return mapOrder(data);
}

export async function generateWhatsAppLink(
  orderId: number,
  authHeaders: Record<string, string>,
): Promise<string | null> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/whatsapp`, {
    method: "POST",
    headers: authHeaders,
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.whatsappUrl;
}

export async function getAdminUsers(
  params: Record<string, string> = {},
  authHeaders: Record<string, string>,
): Promise<any[]> {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/admin/users?${searchParams}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
}

export async function getAdminSettings(
  authHeaders: Record<string, string>,
): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin settings");
  }

  return await res.json();
}

export async function updateAdminSettings(
  settings: Record<string, string>,
  authHeaders: Record<string, string>,
): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    throw new Error("Failed to update settings");
  }

  return await res.json();
}

export async function getSalesAnalytics(
  period: string = "7d",
  authHeaders: Record<string, string>,
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/analytics/sales?period=${period}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch sales analytics");
  }

  return await res.json();
}
