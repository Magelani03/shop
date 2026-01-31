import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@beautystore.com" },
    update: {},
    create: {
      name: "Beauty Store Admin",
      email: "admin@beautystore.com",
      phone: "+1234567890",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      address: "123 Beauty Street",
      city: "Beauty City",
    },
  });

  // Create sample customer
  const customerPassword = await bcrypt.hash("customer123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "customer@example.com",
      phone: "+0987654321",
      passwordHash: customerPassword,
      role: Role.USER,
      address: "456 Customer Lane",
      city: "Customer City",
    },
  });

  // Create products
  const products = [
    {
      name: "Vitamin C Serum",
      description:
        "Brightening serum with 20% Vitamin C for radiant, even-toned skin. Perfect for daily use.",
      price: 45.99,
      rating: 4.8,
      image: "/src/assets/products/serum-oil.jpg",
      category: "Skincare",
      discount: 15,
      stock: 50,
      featured: true,
    },
    {
      name: "Luxurious Body Butter",
      description:
        "Rich, creamy body butter infused with shea butter and natural oils for ultimate hydration.",
      price: 32.5,
      rating: 4.9,
      image: "/src/assets/products/body-butter.jpg",
      category: "Body Care",
      stock: 75,
      featured: true,
    },
    {
      name: "Hydrating Face Cream",
      description:
        "Deep moisturizing cream with hyaluronic acid and ceramides for all-day hydration.",
      price: 38.0,
      rating: 4.7,
      image: "/src/assets/products/cream-jar.jpg",
      category: "Skincare",
      discount: 20,
      stock: 60,
      featured: true,
    },
    {
      name: "Signature Perfume",
      description:
        "Elegant floral fragrance with notes of jasmine, rose, and sandalwood. Long-lasting scent.",
      price: 65.0,
      rating: 4.6,
      image: "/src/assets/products/perfume-bottle.jpg",
      category: "Fragrance",
      stock: 30,
      featured: true,
    },
    {
      name: "Aromatherapy Diffuser",
      description:
        "Ultrasonic essential oil diffuser with LED lights and timer settings for relaxation.",
      price: 49.99,
      rating: 4.5,
      image: "/src/assets/products/diffuser.png",
      category: "Wellness",
      stock: 25,
    },
    {
      name: "Gentle Cleanser",
      description:
        "Sulfate-free cleanser perfect for sensitive skin. Removes makeup while nourishing.",
      price: 24.99,
      rating: 4.8,
      image: "/src/assets/products/white-bottle.jpg",
      category: "Skincare",
      stock: 80,
    },
    {
      name: "Nourishing Hair Mask",
      description:
        "Deep conditioning hair mask with argan oil and keratin for damaged hair.",
      price: 28.5,
      rating: 4.7,
      image: "/src/assets/products/pump-bottles.jpg",
      category: "Hair Care",
      stock: 40,
    },
    {
      name: "Exfoliating Body Scrub",
      description:
        "Natural sugar scrub with coconut oil and vanilla extract for smooth, soft skin.",
      price: 22.0,
      rating: 4.6,
      image: "/src/assets/products/lotion-set.jpg",
      category: "Body Care",
      discount: 25,
      stock: 55,
    },
    {
      name: "Anti-Aging Night Cream",
      description:
        "Advanced night cream with retinol and peptides to reduce fine lines and wrinkles.",
      price: 56.0,
      rating: 4.9,
      image: "/src/assets/products/cream-jar.jpg",
      category: "Skincare",
      stock: 35,
    },
    {
      name: "Relaxing Bath Salts",
      description:
        "Epsom salts infused with lavender and eucalyptus for a spa-like bath experience.",
      price: 18.99,
      rating: 4.4,
      image: "/src/assets/products/candle.jpg",
      category: "Wellness",
      stock: 70,
    },
    {
      name: "Brightening Eye Cream",
      description:
        "Lightweight eye cream with caffeine and vitamin K to reduce dark circles and puffiness.",
      price: 42.0,
      rating: 4.5,
      image: "/src/assets/products/serum-new.jpg",
      category: "Skincare",
      stock: 45,
    },
    {
      name: "Natural Lip Balm Set",
      description:
        "Set of 3 organic lip balms in vanilla, cherry, and mint flavors with SPF protection.",
      price: 15.99,
      rating: 4.7,
      image: "/src/assets/products/skincare-set.jpg",
      category: "Lip Care",
      stock: 90,
    },
  ];

  // Clear existing data in proper order (due to foreign key constraints)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  // Create new products
  await prisma.product.createMany({
    data: products,
  });

  // Create settings
  const settings = [
    {
      key: "store_name",
      value: "Beauty Life Store",
      description: "The name of the store",
    },
    {
      key: "store_description",
      value: "Your premier destination for natural, organic beauty products",
      description: "Store description for SEO and marketing",
    },
    {
      key: "admin_whatsapp",
      value: "+1234567890",
      description:
        "WhatsApp number for order notifications and customer support",
    },
    {
      key: "store_email",
      value: "info@beautystore.com",
      description: "Main store contact email",
    },
    {
      key: "store_address",
      value: "123 Beauty Street, Beauty City, BC 12345",
      description: "Physical store address",
    },
    {
      key: "shipping_cost",
      value: "5.99",
      description: "Standard shipping cost",
    },
    {
      key: "free_shipping_threshold",
      value: "50.00",
      description: "Minimum order amount for free shipping",
    },
    {
      key: "tax_rate",
      value: "0.08",
      description: "Tax rate (8%)",
    },
    {
      key: "currency",
      value: "USD",
      description: "Store currency",
    },
    {
      key: "currency_symbol",
      value: "$",
      description: "Currency symbol for display",
    },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Get created products for orders
  const createdProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  // Create sample orders
  const sampleOrder1 = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "DELIVERED",
      total: 78.49,
      subtotal: 71.99,
      tax: 5.76,
      shipping: 0.0, // Free shipping
      customerName: "Sarah Johnson",
      customerEmail: "customer@example.com",
      customerPhone: "+0987654321",
      shippingAddress: "456 Customer Lane, Customer City, CC 12345",
      notes: "Please leave at front door",
      whatsappSent: true,
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id, // Vitamin C Serum
            quantity: 1,
            price: 45.99,
          },
          {
            productId: createdProducts[1].id, // Body Butter
            quantity: 1,
            price: 32.5,
          },
        ],
      },
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PROCESSING",
      total: 43.99,
      subtotal: 38.0,
      tax: 3.04,
      shipping: 5.99,
      customerName: "Sarah Johnson",
      customerEmail: "customer@example.com",
      customerPhone: "+0987654321",
      shippingAddress: "456 Customer Lane, Customer City, CC 12345",
      whatsappSent: true,
      orderItems: {
        create: [
          {
            productId: createdProducts[2].id, // Face Cream
            quantity: 1,
            price: 38.0,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin user created: ${admin.email} (password: admin123)`);
  console.log(
    `👤 Customer user created: ${customer.email} (password: customer123)`,
  );
  console.log(`📦 ${products.length} products created`);
  console.log(`⚙️ ${settings.length} settings configured`);
  console.log(`📋 2 sample orders created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
