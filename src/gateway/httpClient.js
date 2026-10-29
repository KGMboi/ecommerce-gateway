import { AppError } from '../shared/AppError.js';

// Cliente HTTP común para todos los servicios que consume el gateway.
// Usa fetch (incluido en Node 18+) con límite de tiempo y errores controlados.
export async function fetchJson(url, { timeoutMs = 3000, serviceName = 'servicio' } = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    throw new AppError({
      status: timedOut ? 504 : 502,
      code: timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNREACHABLE',
      message: timedOut
        ? `${serviceName} no respondió en ${timeoutMs} ms.`
        : `No fue posible conectar con ${serviceName}.`,
      service: serviceName,
      cause: err,
    });
  }

  if (response.status === 404) {
    throw new AppError({
      status: 404,
      code: 'UPSTREAM_NOT_FOUND',
      message: `${serviceName} no encontró el recurso solicitado.`,
      service: serviceName,
    });
  }
  if (!response.ok) {
    throw new AppError({
      status: 502,
      code: 'UPSTREAM_BAD_RESPONSE',
      message: `${serviceName} respondió con el código ${response.status}.`,
      service: serviceName,
    });
  }

  try {
    return await response.json();
  } catch (err) {
    throw new AppError({
      status: 502,
      code: 'UPSTREAM_INVALID_JSON',
      message: `${serviceName} devolvió una respuesta que no es JSON válido.`,
      service: serviceName,
      cause: err,
    });
  }
}
