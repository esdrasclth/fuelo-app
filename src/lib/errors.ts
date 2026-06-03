/** Errors carrying an HTTP status, so route handlers can signal 4xx/5xx
 * intent instead of falling through to a generic 500. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Solicitud inválida") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "No autorizado") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "No encontrado") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Demasiados intentos. Intenta de nuevo más tarde.") {
    super(429, message);
    this.name = "TooManyRequestsError";
  }
}

/** Upstream dependency (OSRM, Nominatim) failed or returned nothing usable. */
export class UpstreamError extends HttpError {
  constructor(message = "Servicio no disponible") {
    super(502, message);
    this.name = "UpstreamError";
  }
}
