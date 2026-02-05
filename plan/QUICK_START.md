# 🚀 Quick Start Guide - Twelve Labs SDK Project

## What You Have

A complete, production-ready JavaScript SDK scaffold with:

✅ **Clean Public API** - Only essentials exposed to users  
✅ **TypeScript** - Full type safety and IDE autocomplete  
✅ **Version Management** - Automated synchronization across all files  
✅ **Testing** - Jest setup with sample tests  
✅ **Documentation** - TypeDoc ready to generate  
✅ **Build System** - ESM + CJS output via Rollup  
✅ **Working Example** - Indexes resource fully implemented  

## 📁 What's in the Project

```
twelvelabs-sdk/
├── src/               # Source code
├── tests/             # Tests
├── scripts/           # Version management scripts
├── package.json       # Dependencies and scripts
└── [config files]     # TypeScript, Jest, ESLint, etc.
```

## 🎯 Getting Started

### Step 1: Install Dependencies

```bash
cd twelvelabs-sdk
npm install
```

### Step 2: Verify Setup

```bash
# Run tests to verify everything works
npm test

# Check version sync
npm run version:verify

# Display current version
npm run version:info
```

### Step 3: Try the Example

The Indexes resource is fully implemented as a reference:

```bash
# Look at the implementation
cat src/resources/indexes.ts

# Look at the types
cat src/types/indexes.ts

# Run the unit tests
npm test -- indexes.test
```

## 📝 Next Steps - Implementation Order

### 1. Implement Videos Resource (Week 1)

**Files to create/update:**
- `src/types/videos.ts` - Complete type definitions
- `src/resources/videos.ts` - Implement upload, list, get, update, delete
- `tests/unit/videos.test.ts` - Unit tests

**Reference:** Copy pattern from `indexes.ts`

### 2. Implement Search Resource (Week 1-2)

**Files:**
- `src/types/search.ts`
- `src/resources/search.ts`
- `tests/unit/search.test.ts`

### 3. Implement Embeddings, Tasks, Entities (Week 2-3)

Follow same pattern for each resource.

### 4. Add Integration Tests (Week 3)

**Create:**
- `tests/integration/indexes.integration.test.ts`
- `tests/integration/videos.integration.test.ts`
- etc.

**Requirements:**
- Real API key in environment variable
- Test account with Twelve Labs

### 5. Generate Documentation (Week 4)

```bash
npm run docs:build
```

Opens `docs-build/index.html` in browser.

### 6. Create Examples (Week 4-5)

**Create:**
- `examples/basic-usage.ts`
- `examples/video-upload.ts`
- `examples/search.ts`
- CodeSandbox templates

### 7. CI/CD Setup (Week 5)

**Create:**
- `.github/workflows/ci.yml` - Run tests on PR
- `.github/workflows/release.yml` - Publish on tag
- `.github/workflows/docs.yml` - Deploy docs

## 🛠️ Common Tasks

### Adding a New Resource

1. **Create types** in `src/types/your-resource.ts`
2. **Export types** in `src/types/index.ts`
3. **Create resource class** in `src/resources/your-resource.ts`
4. **Add to client** in `src/client/client.ts`
5. **Write tests** in `tests/unit/your-resource.test.ts`

### Version Bump Workflow

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Bump version
npm run version:bump:minor  # 0.1.0 -> 0.2.0

# 3. Sync versions across all files
npm run version:sync

# 4. Update CHANGELOG.md
# (Edit manually to add your changes)

# 5. Commit version changes
git add .
git commit -m "chore: bump version to 0.2.0"

# 6. Create tag
git tag v0.2.0

# 7. Push
git push origin main --tags
```

### Running Specific Tests

```bash
# Test public API surface
npm test -- public-api

# Test a specific resource
npm test -- indexes

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Building

```bash
# Development build
npm run build

# This creates:
# - dist/index.mjs (ESM)
# - dist/index.cjs (CommonJS)
# - dist/index.d.ts (TypeScript definitions)
```

## 📚 Key Files to Understand

### 1. `src/index.ts` - Public API Gateway
**Only this file controls what users see!**

```typescript
// Add new exports here when you create new resources
export { YourNewResource } from './resources/your-resource';
export type { YourNewType } from './types';
```

### 2. `src/client/client.ts` - Main Entry Point
**Add new resources here:**

```typescript
export class TwelveLabsClient {
  public readonly yourResource: YourResource;
  
  constructor(config: TwelveLabsConfig) {
    // Initialize your resource
    this.yourResource = new YourResource(this.httpClient);
  }
}
```

### 3. `src/internal/http-client.ts` - HTTP Layer
**Already handles:**
- Authentication
- Error normalization
- Request/response logging

**You don't need to modify this usually!**

### 4. `scripts/sync-versions.js` - Version Sync
**Automatically updates:**
- src/version.ts
- typedoc.json
- tests/metadata.json
- CHANGELOG.md

**Run after version bump!**

## 🧪 Testing Strategy

### Unit Tests
- Mock HttpClient
- Test business logic
- Fast, isolated

**Example:** `tests/unit/indexes.test.ts`

### Integration Tests
- Real API calls
- End-to-end workflows
- Require API key

**Example structure:**
```typescript
describe('E2E: Video Upload', () => {
  it('should upload and index a video', async () => {
    const client = new TwelveLabsClient({
      apiKey: process.env.TWELVELABS_API_KEY
    });
    
    const index = await client.indexes.create({ ... });
    const video = await client.videos.upload({ ... });
    // ... assertions
  });
});
```

### Public API Tests
- Verify nothing internal is exposed
- Run on every PR
- Prevents breaking changes

**Example:** `tests/public-api.test.ts`

## 🎨 Code Style

The project uses:
- **ESLint** - Code quality rules
- **Prettier** - Code formatting
- **TypeScript** - Type safety

**Before committing:**
```bash
npm run lint:fix
npm run format
npm run type-check
npm test
```

## 📖 Documentation

### JSDoc Comments

**Every public method needs:**
```typescript
/**
 * Brief description
 * 
 * Longer explanation if needed
 * 
 * @param paramName - Parameter description
 * @returns Return value description
 * 
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * ```typescript
 * const result = await client.resource.method({ ... });
 * ```
 */
```

### Generating Docs

```bash
npm run docs:build
```

TypeDoc reads JSDoc comments and creates beautiful documentation.

## 🔍 Troubleshooting

### "Version mismatch" error in CI
```bash
npm run version:sync
git add .
git commit -m "chore: sync versions"
```

### Tests failing
```bash
# Clear Jest cache
npx jest --clearCache

# Run specific test
npm test -- --testNamePattern="your test name"
```

### Build errors
```bash
# Clean and rebuild
npm run clean
npm run build
```

### TypeScript errors
```bash
# Check types without building
npm run type-check
```

## 🎯 Implementation Checklist

For each new resource, complete these steps:

- [ ] Define types in `src/types/`
- [ ] Export types in `src/types/index.ts`
- [ ] Create resource class in `src/resources/`
- [ ] Add to client in `src/client/client.ts`
- [ ] Export in `src/index.ts` (if needed)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add JSDoc documentation
- [ ] Generate docs to verify
- [ ] Update CHANGELOG.md
- [ ] Create usage examples

## 📞 Need Help?

1. **Check the guides:**
   - PROJECT_STRUCTURE.md (this file)
   - Public API Design Guide
   - Version Management Guide

2. **Look at working examples:**
   - src/resources/indexes.ts
   - tests/unit/indexes.test.ts
   - tests/public-api.test.ts

3. **Run the tests:**
   ```bash
   npm test
   ```

## 🚢 Ready to Ship?

Before publishing v1.0.0:

- [ ] All resources implemented
- [ ] 90%+ test coverage
- [ ] Documentation complete
- [ ] Examples created
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Version synced
- [ ] CI/CD configured
- [ ] Security audit
- [ ] Performance tested

## 🎉 You're Ready!

You now have a solid foundation. Start implementing resources using the Indexes resource as a template. The architecture is designed to scale - just follow the patterns!

Good luck! 🚀
