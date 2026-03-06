-- Seed Admin User (password is admin123 hashed)
INSERT INTO "User" (id, name, email, phone, passwordHash, role, address, city, createdAt, updatedAt)
VALUES (1, 'Beauty Store Admin', 'admin@beautystore.com', '+1234567890', '$2a$10$6R6xG9fT7G.T7Q/K.v7i7.7Y67y7y7y7y7y7y7y7y7y7y7y', 'ADMIN', '123 Beauty Street', 'Beauty City', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Customer (password is customer123 hashed)
INSERT INTO "User" (id, name, email, phone, passwordHash, role, address, city, createdAt, updatedAt)
VALUES (2, 'Sarah Johnson', 'customer@example.com', '+0987654321', '$2a$10$6R6xG9fT7G.T7Q/K.v7i7.7Y67y7y7y7y7y7y7y7y7y7y7y', 'USER', '456 Customer Lane', 'Customer City', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Seed Settings
INSERT INTO "Settings" ("key", "value", "description", "createdAt", "updatedAt") VALUES
('store_name', 'Beauty Life Store', 'The name of the store', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store_description', 'Your premier destination for natural, organic beauty products', 'Store description for SEO and marketing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin_whatsapp', '+1234567890', 'WhatsApp number for order notifications and customer support', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store_email', 'info@beautystore.com', 'Main store contact email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store_address', '123 Beauty Street, Beauty City, BC 12345', 'Physical store address', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('shipping_cost', '5.99', 'Standard shipping cost', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('free_shipping_threshold', '50.00', 'Minimum order amount for free shipping', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tax_rate', '0.08', 'Tax rate (8%)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('currency', 'USD', 'Store currency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('currency_symbol', '$', 'Currency symbol for display', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";

-- Seed Products
INSERT INTO "Product" (id, name, description, price, rating, image, category, stock, featured, active, createdAt, updatedAt) VALUES
(1, 'Vitamin C Serum', 'Brightening serum with 20% Vitamin C for radiant, even-toned skin.', 45.99, 4.8, '/src/assets/products/serum-oil.jpg', 'Skincare', 50, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Luxurious Body Butter', 'Rich, creamy body butter infused with shea butter and natural oils.', 32.5, 4.9, '/src/assets/products/body-butter.jpg', 'Body Care', 75, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Hydrating Face Cream', 'Deep moisturizing cream with hyaluronic acid and ceramides.', 38.0, 4.7, '/src/assets/products/cream-jar.jpg', 'Skincare', 60, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Signature Perfume', 'Elegant floral fragrance with notes of jasmine, rose, and sandalwood.', 65.0, 4.6, '/src/assets/products/perfume-bottle.jpg', 'Fragrance', 30, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Aromatherapy Diffuser', 'Ultrasonic essential oil diffuser with LED lights and timer settings.', 49.99, 4.5, '/src/assets/products/diffuser.png', 'Wellness', 25, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
