import http from 'node:http';
import { createProductsApp } from '../src/services/products/app.js';
import { createInventoryApp } from '../src/services/inventory/app.js';
import { createGatewayApp } from '../src/gateway/app.js';

// Levanta una app Express en un puerto libre y devuelve su URL y una función para cerrarla.
export function listen(app) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

// Simulador de la API de divisas. El comportamiento se puede cambiar durante la prueba.
export function createFakeCurrencyServer() {
  const state = { mode: 'ok', rate: 17, delayMs: 0 };
  const server = http.createServer((req, res) => {
    setTimeout(() => {
      if (state.mode === 'error') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end('{"message":"fallo simulado"}');
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ amount: 1, base: 'USD', date: '2026-10-28', rates: { MXN: state.rate } }),
      );
    }, state.delayMs);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        state,
        url: `http://127.0.0.1:${port}/latest?from=USD&to=MXN`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

// Levanta catálogo, inventario, divisas simuladas y el gateway conectados entre sí.
export async function startStack({ productsDelayMs = 0, inventoryDelayMs = 0, gatewayOptions = {} } = {}) {
  const products = await listen(createProductsApp({ delayMs: productsDelayMs }));
  const inventory = await listen(createInventoryApp({ delayMs: inventoryDelayMs }));
  const currency = await createFakeCurrencyServer();
  const gateway = await listen(
    createGatewayApp({
      productsUrl: products.url,
      inventoryUrl: inventory.url,
      currencyApiUrl: currency.url,
      requestTimeoutMs: 1000,
      ...gatewayOptions,
    }),
  );
  return {
    products,
    inventory,
    currency,
    gateway,
    close: async () => {
      await Promise.all([gateway.close(), products.close(), inventory.close(), currency.close()]);
    },
  };
}

export async function getJson(url) {
  const response = await fetch(url);
  return { status: response.status, body: await response.json() };
}
