// Error controlado de la aplicación: lleva el código HTTP y un código interno estable.
export class AppError extends Error {
  constructor({ status = 500, code = 'INTERNAL_ERROR', message, service = null, cause = undefined }) {
    super(message, { cause });
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.service = service;
  }
}
