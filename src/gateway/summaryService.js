import { AppError } from '../shared/AppError.js';
import { fetchJson } from './httpClient.js';

const LOW_STOCK_THRESHOLD = 5;

export function stockStatusFor(units) {
  if (units <= 0) return 'OUT_OF_STOCK';
  if (units <= LOW_STOCK_THRESHOLD) return 'LOW_STOCK';
  return 'IN_STOCK';
}

// Convierte el error de un servicio en una advertencia que viaja en la respuesta.
function toWarning(service, reason) {
  return {
    service,
    code: reason?.code ?? 'UNEXPECTED_ERROR',
    message: reason?.message ?? 'Error inesperado.',
  };
}

// El producto es obligatorio: sin catálogo no existe un resumen que devolver.
function toProductError(productId, reason) {
  if (reason?.code === 'UPSTREAM_NOT_FOUND') {
    return new AppError({
      status: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: `No existe el producto ${productId}.`,
      service: 'products-service',
    });
  }
  return new AppError({
    status: reason?.status === 504 ? 504 : 502,
    code: 'PRODUCT_SERVICE_UNAVAILABLE',
    message: 'El servicio de catálogo no está disponible. Intenta de nuevo en unos momentos.',
    service: 'products-service',
    cause: reason,
  });
}

// Composite API: consulta los tres servicios de forma concurrente y unifica la respuesta.
// Inventario y divisas son opcionales: si fallan, la respuesta se entrega como PARTIAL.
export async function buildProductSummary(productId, { productsUrl, inventoryUrl, getRate, timeoutMs }) {
  const id = encodeURIComponent(productId);

  const [productResult, inventoryResult, rateResult] = await Promise.allSettled([
    fetchJson(`${productsUrl}/microservices/products/${id}`, {
      timeoutMs,
      serviceName: 'products-service',
    }),
    fetchJson(`${inventoryUrl}/microservices/inventory/${id}`, {
      timeoutMs,
      serviceName: 'inventory-service',
    }),
    getRate(),
  ]);

  if (productResult.status === 'rejected') {
    throw toProductError(productId, productResult.reason);
  }
  const product = productResult.value;
  const warnings = [];

  let stockStatus = 'UNKNOWN';
  let availableUnits = null;
  if (inventoryResult.status === 'fulfilled') {
    availableUnits = inventoryResult.value.available_units;
    stockStatus = stockStatusFor(availableUnits);
  } else {
    warnings.push(toWarning('inventory-service', inventoryResult.reason));
  }

  let priceMxn = null;
  let conversionSource = 'UNAVAILABLE';
  if (rateResult.status === 'fulfilled') {
    priceMxn = Math.round(product.base_price_usd * rateResult.value.rate * 100) / 100;
    conversionSource = rateResult.value.source;
  } else {
    warnings.push(toWarning('currency-api', rateResult.reason));
  }

  const summary = {
    product_id: product.product_id,
    title: product.name,
    price_usd: product.base_price_usd,
    price_mxn: priceMxn,
    stock_status: stockStatus,
    available_units: availableUnits,
    currency_conversion_source: conversionSource,
    status: warnings.length === 0 ? 'SUCCESS' : 'PARTIAL',
  };
  if (warnings.length > 0) {
    summary.warnings = warnings;
  }
  return summary;
}
