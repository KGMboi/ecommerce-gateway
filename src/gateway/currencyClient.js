import { AppError } from '../shared/AppError.js';
import { fetchJson } from './httpClient.js';

// Toma la tasa de cambio de la respuesta de Frankfurter.
// v1: { "amount": 1, "base": "USD", "date": "...", "rates": { "MXN": 17.2 } }
// También acepta { "rate": 17.2 } o [{ "quote": "MXN", "rate": 17.2 }].
export function extractRate(data, quote) {
  let rate = data?.rates?.[quote];
  if (rate === undefined && Array.isArray(data)) {
    rate = data.find((item) => item.quote === quote)?.rate;
  }
  if (rate === undefined) {
    rate = data?.rate;
  }
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new AppError({
      status: 502,
      code: 'UPSTREAM_INVALID_RATE',
      message: `La API de divisas no devolvió una tasa válida para ${quote}.`,
      service: 'currency-api',
    });
  }
  return rate;
}

// Cliente de la API externa. Guarda la última tasa válida para usarla si la API falla.
export function createCurrencyClient({ url, timeoutMs, ttlMs, sourceName, now = Date.now }) {
  let cached = null; // { rate, fetchedAt }

  async function getUsdToMxn() {
    try {
      const data = await fetchJson(url, { timeoutMs, serviceName: 'currency-api' });
      const rate = extractRate(data, 'MXN');
      cached = { rate, fetchedAt: now() };
      return { rate, source: sourceName };
    } catch (err) {
      if (cached && now() - cached.fetchedAt <= ttlMs) {
        return { rate: cached.rate, source: `${sourceName} (cache)` };
      }
      throw err;
    }
  }

  return { getUsdToMxn };
}
