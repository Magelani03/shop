import type { Product } from '@/lib/store';

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number | string;
  rating: number;
  image: string;
  category: string;
  discount: number | null;
}

function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    // Prisma Decimal comes through JSON as string, normalise to number
    price: typeof dto.price === 'string' ? parseFloat(dto.price) : dto.price,
    rating: dto.rating,
    image: dto.image,
    category: dto.category,
    discount: dto.discount ?? undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = (await res.json()) as ProductDto[];
  return data.map(mapProduct);
}

export async function getProduct(id: number): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  const data = (await res.json()) as ProductDto;
  return mapProduct(data);
}
