import { Router } from 'express';
import { AppError } from '../shared/AppError.js';
import { buildProductSummary } from './summaryService.js';

const PRODUCT_ID_PATTERN = /^P-\d{3}$/;

// Punto de entrada único para el cliente.
export function createSummaryRouter(deps) {
  const router = Router();

  async function handler(req, res, next) {
    try {
      if (!PRODUCT_ID_PATTERN.test(req.params.id)) {
        throw new AppError({
          status: 400,
          code: 'INVALID_PRODUCT_ID',
          message: 'El identificador del producto debe tener el formato P-101.',
        });
      }
      const summary = await buildProductSummary(req.params.id, deps);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }

  // Ruta principal y alias con la forma REST clásica
  router.get('/api/v1/product-summary/:id', handler);
  router.get('/api/v1/products/:id/summary', handler);
  return router;
}
