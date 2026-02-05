# Public API Design & Documentation Strategy

## Problem Statement

**Too much exposed interface = Confused developers**

When building an SDK, we need to:
1. ✅ Expose only what developers actually need
2. ✅ Hide internal implementation details
3. ✅ Make documentation clear and focused
4. ✅ Prevent breaking changes to internal code

---

## Core Principle: Minimal Public Surface Area

**Only expose what users need to consume, hide everything else.**

```typescript
// ❌ BAD: Everything is public
export class VideoUploader { /* ... */ }
export class ChunkManager { /* ... */ }
export class ProgressTracker { /* ... */ }
export class RetryHandler { /* ... */ }
export interface UploadConfig { /* ... */ }
export interface ChunkConfig { /* ... */ }

// ✅ GOOD: Only expose what users interact with
export class TwelveLabsClient {
  videos: Videos;
  // Internal helpers are private
}
```

---

## Public API Design Strategy

### 1. Single Entry Point Pattern

**Users should start with ONE class:**

```typescript
// src/index.ts - ONLY public exports
export { TwelveLabsClient } from './client/client';
export type { TwelveLabsConfig } from './client/client';

// Export only types users need for parameters
export type {
  // Index types
  CreateIndexParams,
  UpdateIndexParams,
  Index,
  
  // Video types
  UploadVideoParams,
  Video,
  
  // Search types
  SearchParams,
  SearchResult,
  
  // Common types
  PaginationParams,
  PaginatedResponse,
} from './types';

// Export error classes users might catch
export {
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from './client/errors';

// That's it! Nothing else is exported.
```

### 2. Facade Pattern for Resources

**Internal complexity hidden behind clean interfaces:**

```typescript
// src/client/client.ts
export class TwelveLabsClient {
  // Public resource accessors
  public readonly indexes: Indexes;
  public readonly videos: Videos;
  public readonly search: Search;
  public readonly embeddings: Embeddings;
  public readonly tasks: Tasks;
  
  // Private internals
  private readonly httpClient: HttpClient;
  private readonly config: TwelveLabsConfig;
  
  constructor(config: TwelveLabsConfig) {
    this.httpClient = new HttpClient(config); // Not exposed
    this.indexes = new Indexes(this.httpClient); // Exposed
    this.videos = new Videos(this.httpClient);
    // ...
  }
  
  // Simple utility methods
  public getVersion(): string {
    return VERSION;
  }
}

// Users interact like this:
const client = new TwelveLabsClient({ apiKey: '...' });
await client.indexes.create({ /* ... */ });
await client.videos.upload({ /* ... */ });
```

### 3. Internal Module Pattern

**Use TypeScript's module system to hide internals:**

```typescript
// src/internal/ - Never exported in index.ts
// src/internal/http-client.ts
// src/internal/rate-limiter.ts
// src/internal/retry-handler.ts
// src/internal/upload-manager.ts

// These are used by public classes but never exposed to users
```

---

## Documentation Generation Strategy

### TypeDoc Configuration for Clean Docs

```json
{
  "entryPoints": ["src/index.ts"],
  "entryPointStrategy": "expand",
  "exclude": [
    "**/internal/**",
    "**/utils/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "categoryOrder": [
    "Client",
    "Resources",
    "Types",
    "Errors",
    "*"
  ],
  "readme": "README.md",
  "plugin": ["typedoc-plugin-missing-exports"]
}
```

**Result:** Documentation only shows:
- ✅ `TwelveLabsClient` class
- ✅ Resource classes (`Indexes`, `Videos`, etc.)
- ✅ Public parameter types
- ✅ Public response types
- ✅ Error classes

**Hidden from docs:**
- ❌ Internal HTTP client
- ❌ Retry logic
- ❌ Rate limiting implementation
- ❌ Upload chunk management
- ❌ Internal utilities

---

## File Structure for Public/Private Separation

```
src/
├── index.ts                    # PUBLIC: Only public exports
│
├── client/
│   ├── client.ts               # PUBLIC: Main client class
│   └── errors.ts               # PUBLIC: Error classes
│
├── resources/                  # PUBLIC: User-facing resources
│   ├── indexes.ts
│   ├── videos.ts
│   ├── search.ts
│   ├── embeddings.ts
│   └── tasks.ts
│
├── types/                      # PUBLIC: Parameter/response types
│   ├── index.ts
│   ├── requests.ts
│   └── responses.ts
│
└── internal/                   # PRIVATE: Never exported
    ├── http-client.ts
    ├── auth.ts
    ├── rate-limiter.ts
    ├── retry-handler.ts
    ├── upload-manager.ts
    ├── pagination-helper.ts
    └── validators.ts
```

---

## Practical Example: Video Upload

### ❌ Bad Design (Too Much Exposed)

```typescript
// Everything is public - confusing!
export class VideoUploader {
  public chunkSize: number;
  public maxRetries: number;
  public uploadChunk(chunk: Blob): Promise<void>;
  public retryChunk(chunkId: string): Promise<void>;
  public getProgress(): ProgressInfo;
}

export class ChunkManager {
  public createChunks(file: File): Chunk[];
  public validateChunk(chunk: Chunk): boolean;
}

export class ProgressTracker {
  public updateProgress(bytes: number): void;
  public getPercentage(): number;
}

// User sees all this complexity:
const uploader = new VideoUploader();
const chunkManager = new ChunkManager();
const tracker = new ProgressTracker();
// ... too many things to understand!
```

### ✅ Good Design (Simple Public API)

```typescript
// src/resources/videos.ts - PUBLIC
export class Videos {
  async upload(params: UploadVideoParams): Promise<Video> {
    // Internal complexity hidden
    const uploader = new VideoUploader(this.httpClient); // private
    return uploader.upload(params);
  }
}

// src/types/requests.ts - PUBLIC
export interface UploadVideoParams {
  indexId: string;
  file?: File | Blob;
  url?: string;
  onProgress?: (progress: UploadProgress) => void;
}

// src/types/responses.ts - PUBLIC
export interface UploadProgress {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
}

// src/internal/video-uploader.ts - PRIVATE (not exported)
class VideoUploader {
  private chunkManager: ChunkManager;
  private retryHandler: RetryHandler;
  
  async upload(params: UploadVideoParams): Promise<Video> {
    // Complex logic here, but users don't see it
  }
}

// User sees only this:
const client = new TwelveLabsClient({ apiKey: '...' });
await client.videos.upload({
  indexId: 'idx_123',
  file: myFile,
  onProgress: (p) => console.log(p.percentage)
});
```

---

## TypeScript Access Modifiers Strategy

### Use TypeScript modifiers consistently:

```typescript
export class TwelveLabsClient {
  // Public - users can access
  public readonly indexes: Indexes;
  public readonly videos: Videos;
  
  // Private - users cannot access, not in docs
  private readonly httpClient: HttpClient;
  private readonly config: TwelveLabsConfig;
  
  // Internal - accessible within package, not exported
  /** @internal */
  public _getHttpClient(): HttpClient {
    return this.httpClient;
  }
}
```

**TypeDoc respects these:**
- `private` → Not in documentation
- `protected` → Not in documentation (with config)
- `/** @internal */` → Not in documentation

---

## Type Export Strategy

### Only export types users need to provide

```typescript
// src/types/index.ts

// ✅ EXPORT: Types for parameters (users provide these)
export type {
  // Requests
  CreateIndexParams,
  UploadVideoParams,
  SearchParams,
  
  // Callbacks
  ProgressCallback,
  ErrorCallback,
  
  // Config
  TwelveLabsConfig,
} from './requests';

// ✅ EXPORT: Types for responses (users receive these)
export type {
  Index,
  Video,
  SearchResult,
  Task,
  Embedding,
} from './responses';

// ✅ EXPORT: Common utility types users might need
export type {
  PaginationParams,
  PaginatedResponse,
  SortOrder,
} from './common';

// ❌ DON'T EXPORT: Internal types
// InternalHttpConfig - users don't configure this
// RetryConfig - handled internally
// ChunkMetadata - internal upload detail
```

---

## Documentation Examples

### Good Documentation Structure

**API Reference** (Auto-generated by TypeDoc):
```
Twelve Labs JavaScript SDK
│
├── Classes
│   ├── TwelveLabsClient          # Main entry point
│   ├── Indexes                   # Index management
│   ├── Videos                    # Video operations
│   ├── Search                    # Search operations
│   └── Errors
│       ├── TwelveLabsError
│       ├── AuthenticationError
│       └── ValidationError
│
├── Interfaces (Request Types)
│   ├── TwelveLabsConfig
│   ├── CreateIndexParams
│   ├── UploadVideoParams
│   └── SearchParams
│
└── Interfaces (Response Types)
    ├── Index
    ├── Video
    ├── SearchResult
    └── PaginatedResponse<T>
```

**Manual Guides** (docs/guides/):
```
guides/
├── getting-started.md           # Installation + first API call
├── authentication.md            # API key setup
├── uploading-videos.md          # Video upload guide
├── searching.md                 # Search guide
├── error-handling.md            # Error handling patterns
└── advanced/
    ├── pagination.md
    ├── batch-operations.md
    └── webhooks.md
```

---

## JSDoc Strategy for Clean Documentation

### Document ONLY public methods with examples

```typescript
export class Videos {
  /**
   * Upload a video to an index for processing
   * 
   * Supports both file uploads and URL-based imports.
   * For large files, the upload is automatically chunked
   * and you can track progress via the onProgress callback.
   * 
   * @param params - Upload configuration
   * @returns Promise resolving to the created video
   * 
   * @throws {AuthenticationError} If API key is invalid
   * @throws {ValidationError} If parameters are invalid
   * @throws {RateLimitError} If rate limit is exceeded
   * 
   * @example
   * Upload from file with progress tracking:
   * ```typescript
   * const video = await client.videos.upload({
   *   indexId: 'idx_123',
   *   file: myFile,
   *   onProgress: (progress) => {
   *     console.log(`${progress.percentage}% complete`);
   *   }
   * });
   * ```
   * 
   * @example
   * Upload from URL:
   * ```typescript
   * const video = await client.videos.upload({
   *   indexId: 'idx_123',
   *   url: 'https://example.com/video.mp4'
   * });
   * ```
   */
  async upload(params: UploadVideoParams): Promise<Video> {
    // Implementation hidden from docs
    return this.uploader.upload(params);
  }

  // Private method - no JSDoc needed, won't appear in docs
  private async validateUpload(params: UploadVideoParams): Promise<void> {
    // ...
  }
}
```

### Don't document internal helpers

```typescript
// src/internal/upload-manager.ts
// No /** */ comments - this file is not in public docs

class UploadManager {
  // No JSDoc - internal only
  async uploadChunk(chunk: Blob): Promise<void> {
    // ...
  }
}
```

---

## Example Public API Surface

### What Users See (Complete Public API)

```typescript
import {
  // Main client
  TwelveLabsClient,
  
  // Configuration
  TwelveLabsConfig,
  
  // Request types
  CreateIndexParams,
  UploadVideoParams,
  SearchParams,
  
  // Response types
  Index,
  Video,
  SearchResult,
  
  // Errors
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  
} from '@twelvelabs/sdk';

// Usage is simple and clear
const client = new TwelveLabsClient({ apiKey: '...' });

const index = await client.indexes.create({
  name: 'My Index',
  engines: [{ name: 'marengo2.6', options: ['visual'] }]
});

const video = await client.videos.upload({
  indexId: index.id,
  file: myFile
});

const results = await client.search.query({
  indexId: index.id,
  query: 'person walking'
});
```

**That's it!** Only 3 main objects: `client`, resource objects, and parameter/response types.

---

## Testing Public API Surface

### Create a "public API test"

```typescript
// tests/public-api.test.ts
import * as SDK from '../src/index';

describe('Public API Surface', () => {
  it('should only export expected public members', () => {
    const publicExports = Object.keys(SDK);
    
    const expectedExports = [
      'TwelveLabsClient',
      'TwelveLabsError',
      'AuthenticationError',
      'ValidationError',
      'RateLimitError',
      'NotFoundError',
    ];
    
    // Ensure we're not accidentally exposing internals
    expect(publicExports.sort()).toEqual(expectedExports.sort());
  });
  
  it('should not expose internal classes', () => {
    // These should NOT be importable
    expect(SDK['HttpClient']).toBeUndefined();
    expect(SDK['RetryHandler']).toBeUndefined();
    expect(SDK['UploadManager']).toBeUndefined();
  });
});
```

---

## Migration Strategy: Hiding Already Exposed APIs

If you've already exposed too much:

### 1. Deprecation Warning

```typescript
/**
 * @deprecated Use client.videos.upload() instead.
 * This class will be removed in v2.0.0
 * 
 * Migration:
 * ```typescript
 * // Old
 * const uploader = new VideoUploader();
 * 
 * // New
 * const client = new TwelveLabsClient({ apiKey: '...' });
 * await client.videos.upload(...);
 * ```
 */
export class VideoUploader {
  // ...
}
```

### 2. Mark as Internal

```typescript
/**
 * @internal
 * For internal use only. Do not use directly.
 */
export class VideoUploader {
  // ...
}
```

### 3. Remove from Exports (Breaking Change)

```typescript
// src/index.ts

// v1.x - exposed
export { VideoUploader } from './internal/upload';

// v2.x - removed
// VideoUploader is now internal only
```

---

## Documentation Page Structure

### Landing Page (docs/index.html)

```html
<h1>Twelve Labs JavaScript SDK</h1>

<div class="quick-start">
  <h2>Quick Start</h2>
  <pre><code>
npm install @twelvelabs/sdk
  </code></pre>
  
  <pre><code>
import { TwelveLabsClient } from '@twelvelabs/sdk';

const client = new TwelveLabsClient({ apiKey: 'YOUR_API_KEY' });
const results = await client.search.query({ ... });
  </code></pre>
  
  <a href="/guides/getting-started">Full Getting Started Guide →</a>
</div>

<div class="main-concepts">
  <h2>Main Concepts</h2>
  <ul>
    <li><a href="/api/classes/TwelveLabsClient">TwelveLabsClient</a> - Main entry point</li>
    <li><a href="/api/classes/Indexes">Indexes</a> - Manage video indexes</li>
    <li><a href="/api/classes/Videos">Videos</a> - Upload and manage videos</li>
    <li><a href="/api/classes/Search">Search</a> - Search your videos</li>
  </ul>
</div>

<!-- NO mention of internal classes -->
```

---

## README.md Public API Section

```markdown
## API Overview

The SDK provides a simple, intuitive interface:

### Core Classes

- **`TwelveLabsClient`** - Main client for all operations
- **`Indexes`** - Index management (accessed via `client.indexes`)
- **`Videos`** - Video operations (accessed via `client.videos`)
- **`Search`** - Search functionality (accessed via `client.search`)
- **`Embeddings`** - Generate embeddings (accessed via `client.embeddings`)
- **`Tasks`** - Async task management (accessed via `client.tasks`)

### Key Types

Request types you'll provide:
- `CreateIndexParams`, `UpdateIndexParams`
- `UploadVideoParams`
- `SearchParams`
- `EmbeddingParams`

Response types you'll receive:
- `Index`, `Video`, `SearchResult`, `Task`, `Embedding`

### Error Classes

- `TwelveLabsError` - Base error class
- `AuthenticationError` - Invalid API key
- `ValidationError` - Invalid parameters
- `RateLimitError` - Rate limit exceeded
- `NotFoundError` - Resource not found

See [API Documentation](https://yourorg.github.io/sdk/latest/api) for complete details.
```

---

## Benefits of Minimal Public API

### ✅ For Users:
1. **Easier to learn** - Less to understand
2. **Clearer documentation** - Focused on what they need
3. **Better IDE autocomplete** - Less noise
4. **Fewer breaking changes** - Internal refactors don't affect them

### ✅ For Maintainers:
1. **Freedom to refactor** - Internal code can change freely
2. **Smaller API surface to test** - Less to maintain
3. **Easier to version** - Fewer compatibility concerns
4. **Better encapsulation** - Clear boundaries

---

## Summary Checklist

When designing your SDK:

- [ ] Single entry point: `TwelveLabsClient`
- [ ] Resources accessed via client properties
- [ ] Only export what users directly interact with
- [ ] Use `internal/` folder for implementation details
- [ ] Configure TypeDoc to exclude internals
- [ ] Use TypeScript access modifiers (private, @internal)
- [ ] Document only public methods with JSDoc
- [ ] Test that public API surface is minimal
- [ ] Provide migration guides for breaking changes
- [ ] Keep README focused on public API

**Golden Rule:** If users don't need to call it, don't export it.
