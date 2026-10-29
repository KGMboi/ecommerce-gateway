import { AppError } from '../shared/AppError.js';

// Ruta inexistente
export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'ERROR',
    error: { code: 'ROUTE_NOT_FOUND', message: `La ruta ${req.method} ${req.path} no existe.` },
  });
}

// Manejador global: ningún error llega al cliente con detalles internos.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: 'ERROR',
      error: { code: err.code, message: err.message, ...(err.service && { service: err.service }) },
    });
  }
  console.error('[gateway] error inesperado:', err);
  return res.status(500).json({
    status: 'ERROR',
    error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno. Intenta de nuevo más tarde.' },
  });
}
