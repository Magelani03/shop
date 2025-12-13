import bodyButter from '@/assets/products/body-butter.jpg';
import serumOil from '@/assets/products/serum-oil.jpg';
import candle from '@/assets/products/candle.jpg';
import perfumeBottle from '@/assets/products/perfume-bottle.jpg';
import featuredProducts from '@/assets/products/featured-products.jpg';
import pumpBottles from '@/assets/products/pump-bottles.jpg';
import candleStone from '@/assets/products/candle-stone.jpg';
import serumNew from '@/assets/products/serum-new.jpg';
import skincareSet from '@/assets/products/skincare-set.jpg';
import diffuser from '@/assets/products/diffuser.png';
import fentyProducts from '@/assets/products/fenty-products.png';
import creamJar from '@/assets/products/cream-jar.jpg';
import whiteBottle from '@/assets/products/white-bottle.jpg';
import lotionSet from '@/assets/products/lotion-set.jpg';

export const products = [
  {
    id: 1,
    name: 'Body Butter - Summer Coconut',
    description: 'Natural body butter with coconut extract. 16oz | 480ml. Moisturizing formula for soft, supple skin.',
    price: 55,
    rating: 4.8,
    image: bodyButter,
    category: 'Body Care',
  },
  {
    id: 2,
    name: 'Essential Serum Oil',
    description: 'Premium organic serum oil with natural botanicals. Perfect for daily skincare routine.',
    price: 67,
    rating: 4.9,
    image: serumOil,
    category: 'Face Care',
  },
  {
    id: 3,
    name: 'Aromatherapy Candle',
    description: 'Hand-poured soy candle with essential oils. Creates a calming atmosphere.',
    price: 45,
    rating: 4.7,
    image: candle,
    category: 'Home',
  },
  {
    id: 4,
    name: 'Perfume Bottle Mockup',
    description: 'Elegant perfume with notes of jasmine and sandalwood. Long-lasting fragrance.',
    price: 89,
    rating: 4.6,
    image: perfumeBottle,
    category: 'Fragrance',
  },
  {
    id: 5,
    name: 'Lorelynn Collection Set',
    description: 'Complete skincare set with face cream, serum, and body lotion. Perfect gift set.',
    price: 165,
    rating: 4.9,
    image: featuredProducts,
    category: 'Sets',
  },
  {
    id: 6,
    name: 'Pump Bottles Duo',
    description: 'Sleek pump bottles with moisturizing formula. Ideal for daily use.',
    price: 75,
    rating: 4.5,
    image: pumpBottles,
    category: 'Body Care',
  },
  {
    id: 7,
    name: 'Stone Candle Collection',
    description: 'Natural stone-inspired candle with earthy scents. Burns for 50+ hours.',
    price: 58,
    rating: 4.8,
    image: candleStone,
    category: 'Home',
  },
  {
    id: 8,
    name: 'New Serum C+',
    description: 'New and improved Vitamin C serum for brighter, more radiant skin.',
    price: 78,
    rating: 4.9,
    image: serumNew,
    category: 'Face Care',
    discount: 40,
  },
  {
    id: 9,
    name: 'Premium Skincare Set',
    description: 'Luxurious skincare collection on wooden display. Complete routine essentials.',
    price: 199,
    rating: 4.8,
    image: skincareSet,
    category: 'Sets',
  },
  {
    id: 10,
    name: 'EAU DE PARFUM Scented Sticks',
    description: 'Elegant scented diffuser sticks with natural fragrances. Perfect for any room.',
    price: 125.67,
    rating: 4.8,
    image: diffuser,
    category: 'Home',
    discount: 40,
  },
  {
    id: 11,
    name: 'Beauty Essentials Kit',
    description: 'Premium beauty essentials kit with multiple products for complete care.',
    price: 145,
    rating: 4.7,
    image: fentyProducts,
    category: 'Sets',
  },
  {
    id: 12,
    name: 'Cream Jar Premium',
    description: 'High-quality face cream in elegant jar packaging. Deeply nourishing formula.',
    price: 49,
    rating: 4.6,
    image: creamJar,
    category: 'Face Care',
  },
  {
    id: 13,
    name: 'White Perfume Bottle',
    description: 'Elegant white perfume bottle with refined fragrance notes.',
    price: 95,
    rating: 4.7,
    image: whiteBottle,
    category: 'Fragrance',
  },
  {
    id: 14,
    name: 'Body Lotion Set',
    description: 'Complete body lotion set with three premium formulas for different skin types.',
    price: 120,
    rating: 4.8,
    image: lotionSet,
    category: 'Body Care',
  },
];

export const categories = ['All', 'Body Care', 'Face Care', 'Home', 'Fragrance', 'Sets'];

export const getProductById = (id: number) => products.find((p) => p.id === id);

export const getProductsByCategory = (category: string) =>
  category === 'All' ? products : products.filter((p) => p.category === category);
