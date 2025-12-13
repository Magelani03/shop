import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Body Butter - Summer Coconut',
      description:
        'Natural body butter with coconut extract. 16oz | 480ml. Moisturizing formula for soft, supple skin.',
      price: 55,
      rating: 4.8,
      image: '/assets/products/body-butter.jpg',
      category: 'Body Care',
      discount: null,
    },
    {
      name: 'Essential Serum Oil',
      description:
        'Premium organic serum oil with natural botanicals. Perfect for daily skincare routine.',
      price: 67,
      rating: 4.9,
      image: '/assets/products/serum-oil.jpg',
      category: 'Face Care',
      discount: null,
    },
    {
      name: 'Aromatherapy Candle',
      description:
        'Hand-poured soy candle with essential oils. Creates a calming atmosphere.',
      price: 45,
      rating: 4.7,
      image: '/assets/products/candle.jpg',
      category: 'Home',
      discount: null,
    },
    {
      name: 'Perfume Bottle Mockup',
      description:
        'Elegant perfume with notes of jasmine and sandalwood. Long-lasting fragrance.',
      price: 89,
      rating: 4.6,
      image: '/assets/products/perfume-bottle.jpg',
      category: 'Fragrance',
      discount: null,
    },
  ];

  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
