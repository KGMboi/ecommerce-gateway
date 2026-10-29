import express from 'express';
import { findProductById } from './data.js';

// Microservicio 1: catálogo de productos (API propia).
// delayMs permite simular latencia para demostrar el consumo concurrente.
export function createProductsApp({ delayMs = 0 } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/microservices/products/:id', async (req, res) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    const product = findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: `No existe el producto ${req.params.id}.` },
      });
    }
    return res.json(product);
  });

  return app;
}
