// Public Client
export { TwelveLabsClient } from './client/client';
export type { TwelveLabsConfig } from './client/client';

// Resources
export { Indexes } from './resources/indexes';

// Types
export type {
  CreateIndexParams,
  ListIndexesParams,
  UpdateIndexParams,
} from './types/requests';
export type { Index, PaginatedIndexes } from './types/responses';
export type { PaginatedResponse, PageInfo } from './types/common';

// Errors
export {
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from './client/errors';
