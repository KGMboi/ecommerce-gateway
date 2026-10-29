import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startStack, getJson } from './helpers.js';

let stack;
before(async () => {
  stack = await startStack();
});
after(async () => {
  await stack.close();
});

test('devuelve el contrato consolidado con status SUCCESS', async () => {
  const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
  assert.equal(status, 200);
  assert.deepEqual(body, {
    product_id: 'P-101',
    title: 'Laptop Gamer XYZ',
    price_usd: 1200,
    price_mxn: 20400,
    stock_status: 'IN_STOCK',
    available_units: 15,
    currency_conversion_source: 'Frankfurter External API',
    status: 'SUCCESS',
  });
});

test('la ruta alternativa /products/:id/summary devuelve lo mismo', async () => {
  const main = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-102`);
  const alias = await getJson(`${stack.gateway.url}/api/v1/products/P-102/summary`);
  assert.equal(alias.status, 200);
  assert.deepEqual(alias.body, main.body);
});

test('clasifica el inventario: LOW_STOCK y OUT_OF_STOCK', async () => {
  const low = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-103`);
  const out = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-105`);
  assert.equal(low.body.stock_status, 'LOW_STOCK');
  assert.equal(out.body.stock_status, 'OUT_OF_STOCK');
  assert.equal(out.body.available_units, 0);
});

test('un producto inexistente responde 404 PRODUCT_NOT_FOUND', async () => {
  const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-999`);
  assert.equal(status, 404);
  assert.equal(body.status, 'ERROR');
  assert.equal(body.error.code, 'PRODUCT_NOT_FOUND');
});

test('un identificador con formato inválido responde 400', async () => {
  const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/abc`);
  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_PRODUCT_ID');
});

test('una ruta inexistente responde 404 en formato JSON', async () => {
  const { status, body } = await getJson(`${stack.gateway.url}/api/v1/otra-cosa`);
  assert.equal(status, 404);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});
