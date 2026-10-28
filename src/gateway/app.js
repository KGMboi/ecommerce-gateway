import express from 'express';
import { fileURLToPath } from 'node:url';
import { config } from '../shared/config.js';
import { createCurrencyClient } from './currencyClient.js';
import { createSummaryRouter } from './summaryRoutes.js';
import { errorHandler, notFoundHandler } from './errorHandler.js';

const publicDir = fileURLToPath(new URL('../../public', import.meta.url));

// Crea la Composite API. Las opciones permiten sustituir direcciones y tiempos en las pruebas.
export function createGatewayApp(options = {}) {
  const cfg = { ...config, ...options };
  const currency = createCurrencyClient({
    url: cfg.currencyApiUrl,
    timeoutMs: cfg.requestTimeoutMs,
    ttlMs: cfg.rateCacheTtlMs,
    sourceName: cfg.currencySourceName,
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(publicDir));

  app.get('/health', (req, res) => res.json({ status: 'UP' }));

  app.use(
    createSummaryRouter({
      productsUrl: cfg.productsUrl,
      inventoryUrl: cfg.inventoryUrl,
      getRate: currency.getUsdToMxn,
      timeoutMs: cfg.requestTimeoutMs,
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
