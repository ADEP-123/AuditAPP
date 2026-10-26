// Error de aplicación con código HTTP; la capa de presentación lo traduce a respuesta.
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
