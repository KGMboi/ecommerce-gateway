import { Router } from 'express';
import { buildProductSummary } from './summaryService.js';

// Punto de entrada único para el cliente.
export function createSummaryRouter(deps) {
  const router = Router();

  async function handler(req, res, next) {
    try {
      const summary = await buildProductSummary(req.params.id, deps);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }

  router.get('/api/v1/product-summary/:id', handler);
  router.get('/api/v1/products/:id/summary', handler);
  return router;
}
