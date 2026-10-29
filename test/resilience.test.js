import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startStack, getJson } from './helpers.js';

test('si el inventario no responde, entrega PARTIAL con stock UNKNOWN', async () => {
  const stack = await startStack({ gatewayOptions: { inventoryUrl: 'http://127.0.0.1:1' } });
  try {
    const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(status, 200);
    assert.equal(body.status, 'PARTIAL');
    assert.equal(body.stock_status, 'UNKNOWN');
    assert.equal(body.available_units, null);
    assert.equal(body.price_mxn, 20400);
    assert.equal(body.warnings[0].service, 'inventory-service');
  } finally {
    await stack.close();
  }
});

test('si la API de divisas falla, entrega PARTIAL sin precio en MXN', async () => {
  const stack = await startStack();
  try {
    stack.currency.state.mode = 'error';
    const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(status, 200);
    assert.equal(body.status, 'PARTIAL');
    assert.equal(body.price_mxn, null);
    assert.equal(body.currency_conversion_source, 'UNAVAILABLE');
    assert.equal(body.stock_status, 'IN_STOCK');
    assert.equal(body.warnings[0].service, 'currency-api');
  } finally {
    await stack.close();
  }
});

test('si la API de divisas falla después de responder una vez, usa la tasa en caché', async () => {
  const stack = await startStack();
  try {
    const first = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(first.body.price_mxn, 20400);

    stack.currency.state.mode = 'error';
    const second = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(second.body.status, 'SUCCESS');
    assert.equal(second.body.price_mxn, 20400);
    assert.equal(second.body.currency_conversion_source, 'Frankfurter External API (cache)');
  } finally {
    await stack.close();
  }
});

test('si la API de divisas excede el tiempo límite, responde PARTIAL con UPSTREAM_TIMEOUT', async () => {
  const stack = await startStack({ gatewayOptions: { requestTimeoutMs: 100 } });
  try {
    stack.currency.state.delayMs = 500;
    const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(status, 200);
    assert.equal(body.status, 'PARTIAL');
    assert.equal(body.warnings[0].code, 'UPSTREAM_TIMEOUT');
  } finally {
    await stack.close();
  }
});

test('si el catálogo no responde, devuelve 502 PRODUCT_SERVICE_UNAVAILABLE', async () => {
  const stack = await startStack({ gatewayOptions: { productsUrl: 'http://127.0.0.1:1' } });
  try {
    const { status, body } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    assert.equal(status, 502);
    assert.equal(body.status, 'ERROR');
    assert.equal(body.error.code, 'PRODUCT_SERVICE_UNAVAILABLE');
  } finally {
    await stack.close();
  }
});

test('consulta los tres servicios en paralelo: el tiempo total no suma las esperas', async () => {
  const stack = await startStack({ productsDelayMs: 300, inventoryDelayMs: 300 });
  try {
    stack.currency.state.delayMs = 300;
    const started = Date.now();
    const { status } = await getJson(`${stack.gateway.url}/api/v1/product-summary/P-101`);
    const elapsed = Date.now() - started;
    assert.equal(status, 200);
    // En secuencia tardaría al menos 900 ms; en paralelo ronda los 300 ms.
    assert.ok(elapsed < 700, `tardó ${elapsed} ms`);
  } finally {
    await stack.close();
  }
});
