import express from 'express';
import { findInventoryByProductId } from './data.js';

// Microservicio 2: inventario y almacén (API propia).
export function createInventoryApp({ delayMs = 0 } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/microservices/inventory/:productId', async (req, res) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    const item = findInventoryByProductId(req.params.productId);
    if (!item) {
      return res.status(404).json({
        error: {
          code: 'INVENTORY_NOT_FOUND',
          message: `No hay registro de inventario para ${req.params.productId}.`,
        },
      });
    }
    return res.json(item);
  });

  return app;
}
