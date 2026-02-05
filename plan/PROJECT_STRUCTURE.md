# Twelve Labs JavaScript SDK - Project Structure

## Overview

This is a production-ready JavaScript SDK scaffold for the Twelve Labs API with:
- ✅ Minimal public API surface (only essentials exposed)
- ✅ Complete TypeScript support
- ✅ Automated version synchronization
- ✅ Testing infrastructure
- ✅ Documentation generation

## Directory Structure

```
twelvelabs-sdk/
├── src/
│   ├── index.ts                    # PUBLIC EXPORTS ONLY
│   ├── version.ts                  # Auto-generated version info
│   │
│   ├── client/                     # Public client & errors
│   │   ├── client.ts               # TwelveLabsClient (main entry point)
│   │   └── errors.ts               # Error classes
│   │
│   ├── internal/                   # PRIVATE - Not exported
│   │   ├── http-client.ts          # HTTP implementation
│   │   └── base-resource.ts        # Base class for resources
│   │
│   ├── resources/                  # Public resource classes
│   │   ├── indexes.ts              # ✅ Fully implemented
│   │   ├── videos.ts               # ⚠️  Placeholder
│   │   ├── search.ts               # ⚠️  Placeholder
│   │   ├── embeddings.ts           # ⚠️  Placeholder
│   │   ├── tasks.ts                # ⚠️  Placeholder
│   │   └── entities.ts             # ⚠️  Placeholder
│   │
│   └── types/                      # Public type definitions
│       ├── index.ts                # Re-exports all types
│       ├── common.ts               # Common types
│       ├── indexes.ts              # ✅ Fully implemented
│       ├── videos.ts               # ⚠️  Placeholder
│       ├── search.ts               # ⚠️  Placeholder
│       ├── embeddings.ts           # ⚠️  Placeholder
│       ├── tasks.ts                # ⚠️  Placeholder
│       └── entities.ts             # ⚠️  Placeholder
│
├── tests/
│   ├── public-api.test.ts          # Verifies public API surface
│   └── unit/
│       └── indexes.test.ts         # Sample unit test
│
├── scripts/
│   ├── sync-versions.js            # Master version sync script
│   ├── verify-version-sync.js      # CI version verification
│   └── version-info.js             # Display version info
│
├── package.json                    # SINGLE SOURCE OF TRUTH for version
├── tsconfig.json                   # TypeScript config
├── jest.config.js                  # Jest test config
├── rollup.config.js                # Build config (ESM + CJS)
├── typedoc.json                    # Documentation config
├── .eslintrc.js                    # Linting config
├── .prettierrc                     # Code formatting config
├── .gitignore                      # Git ignore rules
├── README.md                       # Main documentation
└── CHANGELOG.md                    # Version history
```

## What's Implemented

### ✅ Fully Working
1. **Project Setup**
   - Package.json with all scripts
   - TypeScript configuration
   - Build system (Rollup for ESM + CJS)
   - Testing framework (Jest)
   - Documentation (TypeDoc)
   - Code quality (ESLint + Prettier)

2. **Core Architecture**
   - TwelveLabsClient (main entry point)
   - HttpClient (internal, hidden from users)
   - BaseResource (internal, hidden from users)
   - Error classes (public)
   - Version management system

3. **Indexes Resource**
   - Complete implementation
   - Full TypeScript types
   - Comprehensive JSDoc documentation
   - Unit tests

4. **Version Synchronization**
   - Automated sync from package.json
   - CI verification
   - CHANGELOG management

### ⚠️ Placeholders (To Be Implemented)
1. **Resources**
   - Videos (upload, list, get, update, delete)
   - Search (query, advanced search)
   - Embeddings (create, get task)
   - Tasks (summarize, generate, classify)
   - Entities (list, extract)

2. **Types**
   - Complete type definitions for all resources
   - Request/response interfaces

3. **Tests**
   - Integration tests
   - More unit tests
   - E2E tests

4. **CI/CD**
   - GitHub Actions workflows
   - Automated releases
   - Documentation deployment

## How to Use

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Run TypeScript compiler in watch mode
npm run dev

# Run tests in watch mode
npm run test:watch
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run with coverage
npm run test:coverage

# Verify public API surface
npm test -- public-api.test.ts
```

### Version Management
```bash
# Bump version
npm run version:bump:patch   # 0.1.0 -> 0.1.1
npm run version:bump:minor   # 0.1.0 -> 0.2.0
npm run version:bump:major   # 0.1.0 -> 1.0.0

# Sync all versions
npm run version:sync

# Verify versions are in sync
npm run version:verify

# Display version info
npm run version:info
```

### Building
```bash
# Build for production
npm run build

# This will:
# 1. Sync versions
# 2. Clean dist/
# 3. Generate TypeScript declarations
# 4. Bundle ESM and CJS formats
```

### Documentation
```bash
# Generate documentation
npm run docs:build

# Serve documentation locally
npm run docs:serve
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## Public API

Users only see and interact with:

```typescript
import {
  // Main client
  TwelveLabsClient,
  
  // Types they need
  type CreateIndexParams,
  type Index,
  // ... other request/response types
  
  // Errors they might catch
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from '@twelvelabs/sdk';

const client = new TwelveLabsClient({ apiKey: '...' });

// Simple, clean API
await client.indexes.create({ ... });
await client.videos.upload({ ... });
await client.search.query({ ... });
```

**Users do NOT see:**
- HttpClient
- BaseResource
- Internal utilities
- Implementation details

This is enforced by:
1. Only exporting public APIs in `src/index.ts`
2. Keeping internals in `src/internal/`
3. TypeDoc configuration excludes internals
4. Tests verify public API surface

## Next Steps

1. **Implement Remaining Resources**
   - Videos resource with upload functionality
   - Search resource
   - Embeddings, Tasks, Entities

2. **Complete Type Definitions**
   - All request/response interfaces
   - Proper TypeScript types

3. **Add More Tests**
   - Integration tests with real API
   - E2E workflows
   - Test all endpoints

4. **Documentation**
   - Complete API reference
   - User guides
   - CodeSandbox examples

5. **CI/CD**
   - GitHub Actions
   - Automated releases
   - Documentation deployment

## Key Design Decisions

1. **Minimal Public API**
   - Only TwelveLabsClient is the entry point
   - All complexity hidden in internal/
   - Clean, focused documentation

2. **Single Source of Truth**
   - Version only in package.json
   - Everything else syncs automatically

3. **TypeScript First**
   - Full type safety
   - Excellent IDE support
   - Self-documenting code

4. **Modern Build**
   - ESM and CJS support
   - Tree-shakeable
   - Small bundle size

## Resources

- [Project Plan](../twelvelabs-sdk-project-plan.md)
- [Version Management Guide](../version-management-guide.md)
- [Public API Design Guide](public-api-design-guide.md)
