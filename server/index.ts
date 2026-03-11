import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import products from './routes/products';
import auth from './routes/auth';
import orders from './routes/orders';
import settings from './routes/settings';
import admin from './routes/admin';



type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

type Variables = {
  prisma: PrismaClient;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use('*', async (c, next) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  c.set('prisma', prisma);
  await next();
});

app.use('*', async (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080', 'http://localhost:5173'];
  return cors({
    origin: origins,
  })(c, next);
});

// Health check
app.get('/api/health', (c) => {
  console.log("DB Binding:", c.env.DB);
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/products', products);
app.route('/api/auth', auth);
app.route('/api/orders', orders);
app.route('/api/settings', settings);
app.route('/api/admin', admin);



export default app;
