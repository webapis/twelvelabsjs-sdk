// Public Client
export { TwelveLabsClient } from './client/client';
export type { TwelveLabsConfig } from './client/client';

// Resources
export { Indexes } from './resources/indexes';

// Types
export type { CreateIndexParams } from './types/requests';
export type { Index } from './types/responses';

// Errors
export {
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from './client/errors';
