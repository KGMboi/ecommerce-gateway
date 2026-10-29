// Configuración central. Cada valor se puede sobrescribir con una variable de entorno.
const gatewayPort = Number(process.env.GATEWAY_PORT ?? 3000);
const productsPort = Number(process.env.PRODUCTS_PORT ?? 3001);
const inventoryPort = Number(process.env.INVENTORY_PORT ?? 3002);

export const config = {
  gatewayPort,
  productsPort,
  inventoryPort,

  // Direcciones de los microservicios que consume la Composite API
  productsUrl: process.env.PRODUCTS_URL ?? `http://localhost:${productsPort}`,
  inventoryUrl: process.env.INVENTORY_URL ?? `http://localhost:${inventoryPort}`,

  // API externa de tipo de cambio (Frankfurter). Si esta dirección falla, usa:
  // https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN
  currencyApiUrl:
    process.env.CURRENCY_API_URL ?? 'https://api.frankfurter.app/latest?from=USD&to=MXN',
  currencySourceName: 'Frankfurter External API',

  // Tiempo máximo de espera por cada servicio y vigencia de la tasa guardada en caché
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 3000),
  rateCacheTtlMs: Number(process.env.RATE_CACHE_TTL_MS ?? 10 * 60 * 1000),
};
