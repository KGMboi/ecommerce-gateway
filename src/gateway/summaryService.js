import { fetchJson } from './httpClient.js';

// Versión inicial: consulta los tres servicios al mismo tiempo con Promise.all.
// Si alguno falla, falla toda la respuesta (se mejora en la rama de resiliencia).
export async function buildProductSummary(productId, { productsUrl, inventoryUrl, getRate, timeoutMs }) {
  const id = encodeURIComponent(productId);

  const [product, inventory, rate] = await Promise.all([
    fetchJson(`${productsUrl}/microservices/products/${id}`, { timeoutMs, serviceName: 'products-service' }),
    fetchJson(`${inventoryUrl}/microservices/inventory/${id}`, { timeoutMs, serviceName: 'inventory-service' }),
    getRate(),
  ]);

  return {
    product_id: product.product_id,
    title: product.name,
    price_usd: product.base_price_usd,
    price_mxn: Math.round(product.base_price_usd * rate.rate * 100) / 100,
    stock_status: inventory.available_units > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    available_units: inventory.available_units,
    currency_conversion_source: rate.source,
    status: 'SUCCESS',
  };
}
