export class TwelveLabsError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'TwelveLabsError';
  }
}

export class AuthenticationError extends TwelveLabsError {
  constructor(message: string, details?: any) {
    super(message, 'authentication_error', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends TwelveLabsError {
  constructor(message: string, details?: any) {
    super(message, 'validation_error', 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends TwelveLabsError {
  constructor(message: string, details?: any) {
    super(message, 'rate_limit_error', 429, details);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends TwelveLabsError {
  constructor(message: string, details?: any) {
    super(message, 'not_found_error', 404, details);
    this.name = 'NotFoundError';
  }
}
