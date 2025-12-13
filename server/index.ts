import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:8080',
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
