# Twelve Labs JavaScript SDK - Project Plan

## Project Overview
Build a comprehensive, production-ready JavaScript SDK for the Twelve Labs API (v1.3) with complete test coverage, documentation, and CodeSandbox examples.

---

## Phase 1: Project Setup & Foundation (Week 1)

### 1.1 Repository & Build Setup
- [ ] Initialize Git repository with proper .gitignore
- [ ] Set up TypeScript configuration
  - Target: ES2020
  - Module: ESNext
  - Declaration files enabled
  - Source maps enabled
- [ ] Configure build tools
  - Rollup/Vite for bundling
  - Multiple output formats: ESM, CJS, UMD
  - Tree-shaking support
- [ ] Set up package.json
  - Proper entry points (main, module, types)
  - Exports map for modern Node.js
  - Peer dependencies
  - Scripts for build, test, docs

### 1.2 Development Environment
- [ ] Configure ESLint with TypeScript support
- [ ] Set up Prettier for code formatting
- [ ] Configure Husky for git hooks
- [ ] Set up lint-staged for pre-commit checks
- [ ] EditorConfig for consistent coding style

### 1.3 Testing Infrastructure
- [ ] Set up Jest with TypeScript support
- [ ] Configure test coverage reporting (Istanbul/NYC)
- [ ] Set up integration test environment
- [ ] Create test fixtures and mocks
- [ ] Configure CI/CD pipeline (GitHub Actions)
  - Run tests on PR
  - Code coverage reports
  - Automated releases
  - Version validation
  - Documentation deployment

**GitHub Actions Workflows:**

**.github/workflows/ci.yml** - Continuous Integration
```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Verify version sync
        run: npm run version:verify
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TWELVELABS_API_KEY: ${{ secrets.TWELVELABS_TEST_API_KEY }}
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

**.github/workflows/release.yml** - Automated Release
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Extract version from tag
        id: extract_version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Verify package.json version matches tag
        run: |
          PACKAGE_VERSION=$(node -p "require('./package.json').version")
          TAG_VERSION=${{ steps.extract_version.outputs.VERSION }}
          if [ "$PACKAGE_VERSION" != "$TAG_VERSION" ]; then
            echo "Version mismatch! package.json: $PACKAGE_VERSION, tag: $TAG_VERSION"
            exit 1
          fi
      
      - name: Sync all versions
        run: npm run version:sync
      
      - name: Build
        run: npm run build
      
      - name: Run all tests
        run: npm run test:all
        env:
          TWELVELABS_API_KEY: ${{ secrets.TWELVELABS_TEST_API_KEY }}
      
      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Build documentation
        run: npm run docs:build
      
      - name: Deploy documentation
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-build
          destination_dir: v${{ steps.extract_version.outputs.VERSION }}
      
      - name: Update latest docs symlink
        run: |
          cd docs-build
          ln -sf v${{ steps.extract_version.outputs.VERSION }} latest
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.extract_version.outputs.VERSION }}
          body_path: RELEASE_NOTES.md
          draft: false
          prerelease: false
      
      - name: Update CodeSandbox examples
        run: npm run codesandbox:update
        env:
          CODESANDBOX_TOKEN: ${{ secrets.CODESANDBOX_TOKEN }}
```

**.github/workflows/docs.yml** - Documentation Deployment
```yaml
name: Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'docs/**'
      - 'package.json'

jobs:
  deploy-docs:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Sync versions
        run: npm run version:sync
      
      - name: Build documentation
        run: npm run docs:build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-build
          keep_files: true  # Keep previous versions
```

**Version verification script:**
```javascript
// scripts/verify-version-sync.js
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const packageVersion = packageJson.version;

console.log(`Verifying all versions match ${packageVersion}...`);

let errors = [];

// Check src/version.ts
const versionFile = fs.readFileSync(
  path.join(__dirname, '../src/version.ts'),
  'utf-8'
);
if (!versionFile.includes(`export const VERSION = '${packageVersion}'`)) {
  errors.push('src/version.ts does not match package.json version');
}

// Check documentation
const docsIndex = fs.readFileSync(
  path.join(__dirname, '../docs/index.md'),
  'utf-8'
);
if (!docsIndex.includes(`Version: ${packageVersion}`)) {
  errors.push('docs/index.md does not match package.json version');
}

// Check test metadata
const testMetadata = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../tests/metadata.json'),
    'utf-8'
  )
);
if (testMetadata.version !== packageVersion) {
  errors.push('tests/metadata.json does not match package.json version');
}

if (errors.length > 0) {
  console.error('❌ Version sync errors found:');
  errors.forEach(err => console.error(`  - ${err}`));
  console.error('\nRun "npm run version:sync" to fix.');
  process.exit(1);
}

console.log('✅ All versions are in sync!');
```

---

## Phase 2: Core SDK Architecture (Week 1-2)

### 2.1 HTTP Client Layer
```
src/
├── client/
│   ├── http-client.ts       # Base HTTP client with retry logic
│   ├── auth.ts              # API key authentication
│   ├── rate-limiter.ts      # Rate limiting implementation
│   └── errors.ts            # Custom error classes
```

**Features:**
- [ ] Axios/Fetch wrapper with interceptors
- [ ] Automatic retry with exponential backoff
- [ ] Request/response logging (debug mode)
- [ ] Error normalization and custom error types
- [ ] Rate limiting per API guidelines
- [ ] Request timeout configuration
- [ ] Request cancellation support

### 2.2 SDK Configuration
```typescript
interface TwelveLabsConfig {
  apiKey: string;
  baseURL?: string;
  version?: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}
```

### 2.3 Public vs Internal Architecture

**Public API** (exported from `src/index.ts`):
```typescript
// Only export what users directly interact with
export { TwelveLabsClient } from './client/client';
export type { TwelveLabsConfig } from './client/client';

// Resource types users receive
export type {
  Index, Video, SearchResult, Task, Embedding,
  CreateIndexParams, UploadVideoParams, SearchParams,
  PaginatedResponse, UploadProgress
} from './types';

// Errors users might catch
export {
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError
} from './client/errors';
```

**Internal API** (`src/internal/` - never exported):
- [ ] BaseResource class for all endpoints
- [ ] HttpClient with retry logic
- [ ] Pagination handler
- [ ] Upload manager with progress tracking
- [ ] Rate limiter
- [ ] Validators
- [ ] Internal utilities

**Key Principle:** Users only see `TwelveLabsClient` and resource methods. All complexity is hidden.

---

## Phase 3: API Endpoint Implementation (Week 2-4)

### 3.1 Index Management (`src/resources/indexes/`)
**Endpoints to implement:**
- [ ] `POST /indexes` - Create index
- [ ] `GET /indexes` - List indexes
- [ ] `GET /indexes/{id}` - Get index
- [ ] `PUT /indexes/{id}` - Update index
- [ ] `DELETE /indexes/{id}` - Delete index

**Class Structure:**
```typescript
class Indexes extends BaseResource {
  create(params: CreateIndexParams): Promise<Index>
  list(params?: ListIndexesParams): Promise<PaginatedIndexes>
  get(indexId: string): Promise<Index>
  update(indexId: string, params: UpdateIndexParams): Promise<Index>
  delete(indexId: string): Promise<void>
}
```

### 3.2 Video Management (`src/resources/videos/`)
**Endpoints to implement:**
- [ ] `POST /indexes/{index-id}/videos` - Upload video
- [ ] `GET /indexes/{index-id}/videos` - List videos
- [ ] `GET /indexes/{index-id}/videos/{id}` - Get video
- [ ] `PUT /indexes/{index-id}/videos/{id}` - Update video
- [ ] `DELETE /indexes/{index-id}/videos/{id}` - Delete video
- [ ] `GET /indexes/{index-id}/videos/{id}/transcription` - Get transcription
- [ ] `GET /indexes/{index-id}/videos/{id}/text-in-video` - Get text in video
- [ ] `GET /indexes/{index-id}/videos/{id}/logo` - Get logo

**Special Features:**
- [ ] Chunked upload for large files
- [ ] Upload progress callbacks
- [ ] URL-based upload support
- [ ] Video indexing status polling

### 3.3 Search (`src/resources/search/`)
**Endpoints to implement:**
- [ ] `POST /search` - Search with text query
- [ ] `POST /search/advanced` - Advanced search with options
- [ ] Image-based search support
- [ ] Combined search (text + visual)

**Features:**
- [ ] Search options configuration (visual, conversation, text_in_video, logo)
- [ ] Pagination support
- [ ] Search result confidence scores
- [ ] Thumbnail retrieval

### 3.4 Embeddings (`src/resources/embeddings/`)
**Endpoints to implement:**
- [ ] `POST /embed` - Create embeddings (v2)
- [ ] `GET /embed/tasks/{task-id}` - Get embedding task
- [ ] Support for video, text, image, audio embeddings
- [ ] Batch embedding operations

### 3.5 Tasks/Analysis (`src/resources/tasks/`)
**Endpoints to implement:**
- [ ] `POST /summarize` - Generate summary
- [ ] `POST /generate` - Generate text
- [ ] `POST /classify` - Classify content
- [ ] `GET /tasks/{id}` - Get task status
- [ ] Task status polling with callbacks

### 3.6 Entities (`src/resources/entities/`)
**Endpoints to implement:**
- [ ] Entity extraction from videos
- [ ] List entities
- [ ] Filter by entity type

---

## Phase 4: TypeScript Type Definitions (Week 3-4)

### 4.1 Request/Response Types
```
src/types/
├── index.ts
├── requests/
│   ├── indexes.ts
│   ├── videos.ts
│   ├── search.ts
│   ├── embeddings.ts
│   └── tasks.ts
└── responses/
    ├── indexes.ts
    ├── videos.ts
    ├── search.ts
    ├── embeddings.ts
    └── tasks.ts
```

### 4.2 Type Safety Features
- [ ] Strict typing for all endpoints
- [ ] Union types for engine options
- [ ] Branded types for IDs
- [ ] Comprehensive JSDoc comments
- [ ] Export all public types

---

## Phase 5: Testing Strategy (Week 4-5)

### 5.1 Unit Tests
**Coverage target: 90%+**

For each endpoint:
- [ ] Request parameter validation
- [ ] Response parsing
- [ ] Error handling
- [ ] Retry logic
- [ ] Rate limiting

### 5.2 Integration Tests
- [ ] Real API calls with test account
- [ ] End-to-end workflows:
  - Create index → Upload video → Search → Delete
  - Generate embeddings
  - Analyze videos
- [ ] Error scenarios (401, 404, 429, 500)
- [ ] Upload large files
- [ ] Pagination handling

### 5.3 Test Documentation
Create test results tracker:
```markdown
## Test Results Matrix

| Endpoint | Unit Tests | Integration Tests | Status |
|----------|-----------|-------------------|--------|
| POST /indexes | ✅ | ✅ | Pass |
| GET /indexes | ✅ | ✅ | Pass |
| ... | ... | ... | ... |
```

### 5.4 Continuous Testing
- [ ] GitHub Actions workflow
- [ ] Test on multiple Node versions (14, 16, 18, 20)
- [ ] Coverage reports to Codecov
- [ ] E2E tests in staging environment

---

## Phase 6: Documentation (Week 5-6)

### 6.1 Auto-Generated API Documentation
**Tool: TypeDoc**

Setup:
- [ ] Configure TypeDoc to exclude internals
- [ ] Custom theme (optional)
- [ ] Deploy to GitHub Pages or Vercel

**TypeDoc Configuration (typedoc.json):**
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
    "Request Types",
    "Response Types",
    "Errors",
    "*"
  ],
  "readme": "README.md",
  "name": "Twelve Labs JavaScript SDK"
}
```

**Generated Documentation Structure:**
```
API Reference
│
├── Classes
│   ├── TwelveLabsClient          # Main entry point
│   ├── Indexes                   # Index management
│   ├── Videos                    # Video operations
│   ├── Search                    # Search operations
│   ├── Embeddings                # Embedding operations
│   ├── Tasks                     # Task operations
│   └── Errors
│       ├── TwelveLabsError
│       ├── AuthenticationError
│       ├── ValidationError
│       ├── RateLimitError
│       └── NotFoundError
│
├── Interfaces (Request Types)
│   ├── TwelveLabsConfig
│   ├── CreateIndexParams
│   ├── UploadVideoParams
│   ├── SearchParams
│   └── ... (only user-provided types)
│
└── Interfaces (Response Types)
    ├── Index
    ├── Video
    ├── SearchResult
    ├── Task
    ├── Embedding
    └── PaginatedResponse<T>

Note: Internal classes like HttpClient, RetryHandler, 
UploadManager are NOT included in documentation.
```

Structure:
```
docs/
├── api/                    # Auto-generated from TypeDoc
├── guides/
│   ├── getting-started.md
│   ├── authentication.md
│   ├── uploading-videos.md
│   ├── searching.md
│   ├── embeddings.md
│   └── error-handling.md
├── examples/
│   ├── basic-search.md
│   ├── video-upload.md
│   ├── batch-processing.md
│   └── advanced-search.md
└── migration/
    └── from-rest-api.md
```

### 6.2 README.md
Comprehensive README with:
- [ ] Version badges (NPM, build status, coverage, docs)
- [ ] Installation instructions
- [ ] Quick start guide
- [ ] Feature list
- [ ] Code examples for each major feature
- [ ] Version compatibility matrix
- [ ] Links to versioned documentation
- [ ] Contributing guidelines
- [ ] License information

**README.md Template with Version Tracking:**
```markdown
# Twelve Labs JavaScript SDK

[![npm version](https://img.shields.io/npm/v/@twelvelabs/sdk.svg)](https://www.npmjs.com/package/@twelvelabs/sdk)
[![Build Status](https://github.com/yourorg/twelvelabs-sdk-js/workflows/CI/badge.svg)](https://github.com/yourorg/twelvelabs-sdk-js/actions)
[![Coverage](https://codecov.io/gh/yourorg/twelvelabs-sdk-js/branch/main/graph/badge.svg)](https://codecov.io/gh/yourorg/twelvelabs-sdk-js)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://yourorg.github.io/twelvelabs-sdk-js/latest)
[![License](https://img.shields.io/npm/l/@twelvelabs/sdk.svg)](LICENSE)

Official JavaScript SDK for the Twelve Labs Video Understanding Platform.

**Current Version:** 1.2.0  
**API Version:** v1.3  
**Last Updated:** 2024-02-05

## 📦 Installation

\`\`\`bash
npm install @twelvelabs/sdk
\`\`\`

## 🚀 Quick Start

\`\`\`typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

const client = new TwelveLabsClient({
  apiKey: 'YOUR_API_KEY'
});

console.log('SDK Version:', client.getVersion());
// Output: SDK Version: 1.2.0
\`\`\`

## 📖 Documentation

- [Latest Documentation](https://yourorg.github.io/twelvelabs-sdk-js/latest)
- [v1.2.0 Documentation](https://yourorg.github.io/twelvelabs-sdk-js/v1.2.0)
- [API Reference](https://yourorg.github.io/twelvelabs-sdk-js/latest/api)
- [Migration Guides](https://yourorg.github.io/twelvelabs-sdk-js/latest/migration)

## 🔄 Version Compatibility

| SDK Version | API Version | Node.js | Status |
|-------------|-------------|---------|--------|
| 1.2.x       | v1.3        | >=16    | ✅ Active |
| 1.1.x       | v1.3        | >=14    | ⚠️ Maintenance |
| 1.0.x       | v1.2        | >=14    | ❌ Deprecated |

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
\`\`\`

### 6.3 JSDoc Comments
For every public method:
```typescript
/**
 * Creates a new index for organizing and searching videos
 * 
 * @param params - Configuration for the new index
 * @param params.name - Name of the index
 * @param params.engines - Array of engine configurations
 * @param params.addons - Optional addons like thumbnail generation
 * @returns Promise resolving to the created index
 * @throws {TwelveLabsError} If API key is invalid
 * @throws {ValidationError} If parameters are invalid
 * 
 * @example
 * ```typescript
 * const index = await client.indexes.create({
 *   name: 'My Video Index',
 *   engines: [
 *     { name: 'marengo2.6', options: ['visual', 'conversation'] }
 *   ]
 * });
 * ```
 */
async create(params: CreateIndexParams): Promise<Index>
```

---

## Phase 7: CodeSandbox Examples (Week 6)

### 7.1 Interactive Examples
Create CodeSandbox templates for:

1. **Basic Setup**
   - [ ] Installation and initialization
   - [ ] Authentication

2. **Index Management**
   - [ ] Create and configure indexes
   - [ ] List and filter indexes

3. **Video Operations**
   - [ ] Upload from file
   - [ ] Upload from URL
   - [ ] Track upload progress
   - [ ] List videos with pagination

4. **Search Examples**
   - [ ] Text-based search
   - [ ] Image-based search
   - [ ] Advanced search with filters
   - [ ] Paginated search results

5. **Embeddings**
   - [ ] Generate video embeddings
   - [ ] Generate text embeddings
   - [ ] Batch embedding generation

6. **Video Analysis**
   - [ ] Generate summaries
   - [ ] Extract entities
   - [ ] Classify content

7. **Real-World Applications**
   - [ ] Video search application
   - [ ] Content moderation dashboard
   - [ ] Video RAG (Retrieval Augmented Generation)

### 7.2 CodeSandbox Repository
- [ ] Create organization account
- [ ] Publish all examples
- [ ] Link from documentation
- [ ] Keep examples updated

---

## Phase 8: Version Management & Synchronization (Week 7)

### 8.1 Version Tracking Strategy

**Single Source of Truth: package.json**
- Code version is defined in `package.json`
- Documentation version automatically syncs with code version
- All artifacts (docs, examples, tests) reference the same version

### 8.2 Version Files & Constants

**Create version tracking files:**

```typescript
// src/version.ts
/** 
 * SDK Version - Auto-generated, do not edit manually
 * Generated from package.json during build
 */
export const VERSION = '__VERSION__'; // Replaced during build
export const API_VERSION = 'v1.3';
export const USER_AGENT = `twelvelabs-js-sdk/${VERSION}`;
```

**Build script replacement:**
```javascript
// scripts/build-version.js
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const versionFile = `
/** 
 * SDK Version - Auto-generated, do not edit manually
 * Generated from package.json during build
 */
export const VERSION = '${packageJson.version}';
export const API_VERSION = 'v1.3';
export const USER_AGENT = \`twelvelabs-js-sdk/\${VERSION}\`;
`.trim();

fs.writeFileSync(
  path.join(__dirname, '../src/version.ts'),
  versionFile
);
```

### 8.3 Documentation Version Synchronization

**TypeDoc Configuration (typedoc.json):**
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "name": "Twelve Labs JavaScript SDK",
  "includeVersion": true,
  "readme": "README.md",
  "customFooterHtml": "SDK Version: __VERSION__ | API Version: v1.3",
  "navigation": {
    "includeVersion": true
  }
}
```

**Version injection script:**
```javascript
// scripts/inject-version-to-docs.js
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

// Inject version into TypeDoc config
const typedocConfig = require('../typedoc.json');
typedocConfig.name = `Twelve Labs JavaScript SDK v${packageJson.version}`;
typedocConfig.customFooterHtml = 
  `SDK Version: ${packageJson.version} | API Version: v1.3`;

// Inject version into documentation header
const docsIndexPath = path.join(__dirname, '../docs/index.md');
let docsContent = fs.readFileSync(docsIndexPath, 'utf-8');
docsContent = docsContent.replace(
  /Version: .*/,
  `Version: ${packageJson.version}`
);
fs.writeFileSync(docsIndexPath, docsContent);

// Update version badge in README
const readmePath = path.join(__dirname, '../README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf-8');
readmeContent = readmeContent.replace(
  /version-[^-]+-/,
  `version-${packageJson.version}-`
);
fs.writeFileSync(readmePath, readmeContent);
```

### 8.4 Version Display in SDK

**Add version to client:**
```typescript
// src/client/client.ts
import { VERSION, API_VERSION, USER_AGENT } from '../version';

export class TwelveLabsClient {
  public static readonly VERSION = VERSION;
  public static readonly API_VERSION = API_VERSION;
  
  constructor(config: TwelveLabsConfig) {
    // Set User-Agent header with version
    this.httpClient.setHeader('User-Agent', USER_AGENT);
  }
  
  /**
   * Get the current SDK version
   */
  getVersion(): string {
    return VERSION;
  }
}
```

### 8.5 Multi-Version Documentation Hosting

**Documentation Structure:**
```
docs/
├── versions.json              # Version registry
├── latest/                    # Symlink to current version
├── v1.0.0/
│   ├── api/                   # TypeDoc output
│   ├── guides/
│   └── examples/
├── v1.1.0/
│   ├── api/
│   ├── guides/
│   └── examples/
└── index.html                 # Version selector page
```

**versions.json:**
```json
{
  "latest": "1.2.0",
  "versions": [
    {
      "version": "1.2.0",
      "released": "2024-02-05",
      "status": "stable",
      "docs_url": "/v1.2.0",
      "breaking_changes": false
    },
    {
      "version": "1.1.0",
      "released": "2024-01-15",
      "status": "stable",
      "docs_url": "/v1.1.0",
      "breaking_changes": false
    },
    {
      "version": "1.0.0",
      "released": "2024-01-01",
      "status": "stable",
      "docs_url": "/v1.0.0",
      "breaking_changes": false
    }
  ],
  "deprecated": []
}
```

**Version selector widget:**
```html
<!-- docs/_includes/version-selector.html -->
<div class="version-selector">
  <label>Version:</label>
  <select onchange="window.location.href=this.value">
    <option value="/latest">Latest (v1.2.0)</option>
    <option value="/v1.2.0">v1.2.0</option>
    <option value="/v1.1.0">v1.1.0</option>
    <option value="/v1.0.0">v1.0.0</option>
  </select>
</div>
```

### 8.6 CodeSandbox Version Pinning

**Package.json in CodeSandbox examples:**
```json
{
  "dependencies": {
    "@twelvelabs/sdk": "1.2.0"
  }
}
```

**Automated update script:**
```javascript
// scripts/update-codesandbox-versions.js
const fs = require('fs');
const glob = require('glob');
const packageJson = require('../package.json');

// Find all CodeSandbox package.json files
const sandboxPackages = glob.sync('examples/codesandbox/**/package.json');

sandboxPackages.forEach(file => {
  const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
  
  if (content.dependencies['@twelvelabs/sdk']) {
    content.dependencies['@twelvelabs/sdk'] = packageJson.version;
    fs.writeFileSync(file, JSON.stringify(content, null, 2));
    console.log(`Updated ${file} to version ${packageJson.version}`);
  }
});
```

### 8.7 Automated Version Management Workflow

**package.json scripts:**
```json
{
  "scripts": {
    "version:bump:patch": "npm version patch --no-git-tag-version",
    "version:bump:minor": "npm version minor --no-git-tag-version",
    "version:bump:major": "npm version major --no-git-tag-version",
    "version:sync": "node scripts/sync-versions.js",
    "prebuild": "npm run version:sync",
    "predocs": "npm run version:sync",
    "prerelease": "npm run version:sync && npm run test:all"
  }
}
```

**Master sync script:**
```javascript
// scripts/sync-versions.js
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

console.log(`Syncing all versions to ${packageJson.version}...`);

// 1. Update src/version.ts
require('./build-version');

// 2. Update documentation
require('./inject-version-to-docs');

// 3. Update CodeSandbox examples
require('./update-codesandbox-versions');

// 4. Update CHANGELOG.md header
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf-8');
const today = new Date().toISOString().split('T')[0];

if (!changelog.includes(`## [${packageJson.version}]`)) {
  const newEntry = `## [${packageJson.version}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;
  changelog = changelog.replace('# Changelog\n\n', `# Changelog\n\n${newEntry}`);
  fs.writeFileSync(changelogPath, changelog);
}

// 5. Update test metadata
const testMetadataPath = path.join(__dirname, '../tests/metadata.json');
const testMetadata = {
  version: packageJson.version,
  lastUpdated: new Date().toISOString(),
  apiVersion: 'v1.3'
};
fs.writeFileSync(testMetadataPath, JSON.stringify(testMetadata, null, 2));

console.log('✅ All versions synchronized!');
console.log(`   Code version: ${packageJson.version}`);
console.log(`   API version: v1.3`);
```

### 8.8 NPM Package Preparation

- [ ] Bundle size optimization
- [ ] Tree-shaking verification
- [ ] Remove dev dependencies from bundle
- [ ] Minification for UMD build

**Package.json Configuration:**
```json
{
  "name": "@twelvelabs/sdk",
  "version": "1.0.0",
  "description": "Official JavaScript SDK for Twelve Labs Video Understanding Platform",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./version": {
      "import": "./dist/version.mjs",
      "require": "./dist/version.cjs",
      "types": "./dist/version.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "keywords": [
    "twelvelabs",
    "video-understanding",
    "video-search",
    "embeddings",
    "ai",
    "video-analysis"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourorg/twelvelabs-sdk-js"
  },
  "bugs": {
    "url": "https://github.com/yourorg/twelvelabs-sdk-js/issues"
  },
  "homepage": "https://docs.yourorg.com/twelvelabs-sdk"
}
```

### 8.9 Release Preparation Checklist

- [ ] Version bumped in package.json (single source of truth)
- [ ] All versions synchronized via `npm run version:sync`
- [ ] CHANGELOG.md updated for current version
- [ ] Documentation generated with matching version
- [ ] CodeSandbox examples updated to use new version
- [ ] Test metadata includes version number
- [ ] Git tag matches package.json version
- [ ] GitHub release matches package.json version
- [ ] NPM package version matches
- [ ] Documentation deployed to versioned URL
- [ ] Beta release tested (if needed)

---

## Phase 9: Testing Dashboard & Validation (Week 7)

### 9.1 Test Results Dashboard
Create an interactive dashboard showing:
- [ ] SDK version being tested
- [ ] API version compatibility
- [ ] Test coverage percentage
- [ ] Endpoint test matrix
- [ ] Integration test results
- [ ] Performance benchmarks
- [ ] Last test run timestamp
- [ ] Version-specific test history

**Implementation:**
- Simple HTML page with test results
- GitHub Actions badge integration
- Automated updates on each CI run
- Version comparison view

**Test Dashboard Structure:**
```html
<!-- test-dashboard/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Twelve Labs SDK - Test Dashboard</title>
    <style>
        body { font-family: system-ui; max-width: 1200px; margin: 40px auto; }
        .version-info { 
            background: #f0f0f0; 
            padding: 20px; 
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .version-badge { 
            display: inline-block;
            padding: 5px 10px;
            background: #4CAF50;
            color: white;
            border-radius: 4px;
            margin: 5px;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .pass { color: #4CAF50; font-weight: bold; }
        .fail { color: #f44336; font-weight: bold; }
        .coverage { 
            display: inline-block;
            width: 100px;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
        }
        .coverage-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%);
        }
    </style>
</head>
<body>
    <h1>Twelve Labs JavaScript SDK - Test Dashboard</h1>
    
    <div class="version-info">
        <h2>Version Information</h2>
        <span class="version-badge">SDK v1.2.0</span>
        <span class="version-badge">API v1.3</span>
        <span class="version-badge">Node 16.x, 18.x, 20.x</span>
        <p><strong>Last Updated:</strong> <span id="lastUpdated">2024-02-05 14:30:00</span></p>
        <p><strong>Build:</strong> <a href="#">#123</a> | <strong>Commit:</strong> <code>abc1234</code></p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p>
            Overall Coverage: 
            <div class="coverage">
                <div class="coverage-bar" style="width: 94%"></div>
            </div>
            94%
        </p>
        <p>Total Tests: 247 | Passed: 247 | Failed: 0 | Skipped: 0</p>
    </div>
    
    <h2>Endpoint Test Matrix - v1.2.0</h2>
    <table id="testMatrix">
        <thead>
            <tr>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Unit Tests</th>
                <th>Integration Tests</th>
                <th>Coverage</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <!-- Auto-generated from test results -->
        </tbody>
    </table>
    
    <h2>Version History</h2>
    <select id="versionSelector" onchange="loadVersion(this.value)">
        <option value="1.2.0" selected>v1.2.0 (Latest)</option>
        <option value="1.1.0">v1.1.0</option>
        <option value="1.0.0">v1.0.0</option>
    </select>
    
    <script src="test-results.js"></script>
</body>
</html>
```

**Test results data generation:**
```javascript
// scripts/generate-test-dashboard.js
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

// Read test results from Jest
const jestResults = require('../coverage/coverage-summary.json');

// Read integration test results
const integrationResults = require('../test-results/integration.json');

const dashboardData = {
  version: packageJson.version,
  apiVersion: 'v1.3',
  timestamp: new Date().toISOString(),
  buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
  commitSha: process.env.GITHUB_SHA || 'local',
  coverage: {
    lines: jestResults.total.lines.pct,
    statements: jestResults.total.statements.pct,
    functions: jestResults.total.functions.pct,
    branches: jestResults.total.branches.pct
  },
  endpoints: [
    {
      endpoint: 'POST /indexes',
      method: 'indexes.create()',
      unitTests: '✅ Pass (5/5)',
      integrationTests: '✅ Pass (3/3)',
      coverage: '98%',
      status: 'pass'
    },
    {
      endpoint: 'GET /indexes',
      method: 'indexes.list()',
      unitTests: '✅ Pass (4/4)',
      integrationTests: '✅ Pass (2/2)',
      coverage: '100%',
      status: 'pass'
    },
    // ... more endpoints
  ],
  history: {
    '1.2.0': { tests: 247, passed: 247, coverage: 94 },
    '1.1.0': { tests: 235, passed: 235, coverage: 92 },
    '1.0.0': { tests: 198, passed: 198, coverage: 88 }
  }
};

// Generate HTML
const html = generateDashboardHTML(dashboardData);
fs.writeFileSync(
  path.join(__dirname, '../test-dashboard/index.html'),
  html
);

// Generate data.js for dynamic loading
fs.writeFileSync(
  path.join(__dirname, '../test-dashboard/data.js'),
  `const testData = ${JSON.stringify(dashboardData, null, 2)};`
);

console.log(`✅ Test dashboard generated for v${packageJson.version}`);
```

### 9.2 Validation Checklist
Before v1.0.0 release:
- [ ] All endpoints implemented
- [ ] 90%+ test coverage
- [ ] All integration tests passing
- [ ] Documentation complete
- [ ] CodeSandbox examples working
- [ ] README reviewed
- [ ] Security audit completed
- [ ] Performance benchmarks acceptable
- [ ] Peer review completed
- [ ] **Version sync verified** (code === docs === tests === examples)
- [ ] **CHANGELOG.md updated** for current version
- [ ] **Git tag created** matching package.json version
- [ ] **NPM package version** matches Git tag
- [ ] **Documentation deployed** to versioned URL
- [ ] **All version badges** updated in README

### 9.3 Version Release Validation Script

```javascript
// scripts/validate-release.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('../package.json');
const version = packageJson.version;

console.log(`🔍 Validating release for v${version}...`);

const checks = [];

// Check 1: Git tag exists
try {
  const tags = execSync('git tag').toString().split('\n');
  const tagExists = tags.includes(`v${version}`);
  checks.push({
    name: 'Git tag matches package version',
    pass: tagExists,
    message: tagExists ? `✅ Tag v${version} exists` : `❌ Tag v${version} not found`
  });
} catch (e) {
  checks.push({ name: 'Git tag check', pass: false, message: '❌ Failed to check git tags' });
}

// Check 2: CHANGELOG has entry for this version
const changelog = fs.readFileSync(path.join(__dirname, '../CHANGELOG.md'), 'utf-8');
const hasChangelogEntry = changelog.includes(`## [${version}]`);
checks.push({
  name: 'CHANGELOG entry exists',
  pass: hasChangelogEntry,
  message: hasChangelogEntry ? '✅ CHANGELOG updated' : '❌ Missing CHANGELOG entry'
});

// Check 3: All versions synced
const versionFile = fs.readFileSync(path.join(__dirname, '../src/version.ts'), 'utf-8');
const versionSynced = versionFile.includes(`'${version}'`);
checks.push({
  name: 'Version files synced',
  pass: versionSynced,
  message: versionSynced ? '✅ Versions synced' : '❌ Run npm run version:sync'
});

// Check 4: Tests pass
try {
  execSync('npm run test:all', { stdio: 'ignore' });
  checks.push({ name: 'All tests pass', pass: true, message: '✅ Tests passing' });
} catch (e) {
  checks.push({ name: 'All tests pass', pass: false, message: '❌ Tests failing' });
}

// Check 5: Coverage meets threshold
const coverage = require('../coverage/coverage-summary.json');
const coveragePct = coverage.total.lines.pct;
const meetsThreshold = coveragePct >= 90;
checks.push({
  name: 'Coverage threshold (90%)',
  pass: meetsThreshold,
  message: meetsThreshold ? `✅ Coverage: ${coveragePct}%` : `❌ Coverage: ${coveragePct}%`
});

// Check 6: Build succeeds
try {
  execSync('npm run build', { stdio: 'ignore' });
  checks.push({ name: 'Build succeeds', pass: true, message: '✅ Build successful' });
} catch (e) {
  checks.push({ name: 'Build succeeds', pass: false, message: '❌ Build failed' });
}

// Print results
console.log('\n📋 Release Validation Results:\n');
checks.forEach(check => {
  console.log(check.message);
});

const allPassed = checks.every(c => c.pass);

if (allPassed) {
  console.log('\n✅ All checks passed! Ready to release v' + version);
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix before releasing.');
  process.exit(1);
}
```

---

## Technical Architecture

### Project Structure
```
twelvelabs-sdk/
├── src/
│   ├── index.ts                     # PUBLIC EXPORTS ONLY
│   │
│   ├── client/                      # Public client
│   │   ├── client.ts                # TwelveLabsClient (public)
│   │   └── errors.ts                # Error classes (public)
│   │
│   ├── resources/                   # Public resources
│   │   ├── indexes.ts               # Indexes class (public)
│   │   ├── videos.ts                # Videos class (public)
│   │   ├── search.ts                # Search class (public)
│   │   ├── embeddings.ts            # Embeddings class (public)
│   │   ├── tasks.ts                 # Tasks class (public)
│   │   └── entities.ts              # Entities class (public)
│   │
│   ├── types/                       # Public types
│   │   ├── index.ts                 # Re-exports
│   │   ├── requests.ts              # Parameter types (public)
│   │   ├── responses.ts             # Response types (public)
│   │   └── common.ts                # Common types (public)
│   │
│   ├── internal/                    # PRIVATE - Never exported
│   │   ├── http-client.ts           # HTTP implementation
│   │   ├── base-resource.ts         # Base class for resources
│   │   ├── auth.ts                  # Authentication logic
│   │   ├── rate-limiter.ts          # Rate limiting
│   │   ├── retry-handler.ts         # Retry logic
│   │   ├── upload-manager.ts        # Upload implementation
│   │   ├── pagination-helper.ts     # Pagination logic
│   │   └── validators.ts            # Input validation
│   │
│   └── utils/                       # PRIVATE - Internal utilities
│       ├── logger.ts
│       └── helpers.ts
│
├── tests/
│   ├── unit/
│   │   ├── resources/               # Test public methods
│   │   └── internal/                # Test internal logic
│   ├── integration/
│   │   └── public-api.test.ts       # Verify public surface
│   └── fixtures/
│
├── docs/
│   ├── api/                         # TypeDoc output (public only)
│   └── guides/                      # Manual guides
│
├── examples/                        # Show public API usage only
│
└── typedoc.json                     # Configured to exclude internals
```

### Key Design Decisions

#### 1. **Modular Architecture**
- Each resource in separate module
- Easy to extend and maintain
- Clear separation of concerns

#### 2. **TypeScript First**
- Full type safety
- Excellent IDE autocomplete
- Self-documenting code

#### 3. **Error Handling Strategy**
```typescript
class TwelveLabsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
  }
}

// Specific error types
class AuthenticationError extends TwelveLabsError {}
class ValidationError extends TwelveLabsError {}
class RateLimitError extends TwelveLabsError {}
class NotFoundError extends TwelveLabsError {}
```

#### 4. **Retry Logic**
```typescript
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  exponentialBackoff: true
}
```

#### 5. **Upload Progress**
```typescript
await client.videos.upload({
  indexId: 'index_123',
  file: videoFile,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});
```

---

## Testing Strategy Details

### Unit Test Example
```typescript
describe('Indexes Resource', () => {
  describe('create', () => {
    it('should create an index with valid parameters', async () => {
      const mockResponse = { id: 'idx_123', name: 'Test Index' };
      mockHttpClient.post.mockResolvedValue(mockResponse);
      
      const result = await indexes.create({
        name: 'Test Index',
        engines: [{ name: 'marengo2.6', options: ['visual'] }]
      });
      
      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/indexes',
        expect.objectContaining({ name: 'Test Index' })
      );
    });
    
    it('should throw ValidationError for missing name', async () => {
      await expect(
        indexes.create({ engines: [] } as any)
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### Integration Test Example
```typescript
describe('End-to-End Video Search', () => {
  let client: TwelveLabsClient;
  let indexId: string;
  let videoId: string;
  
  beforeAll(async () => {
    client = new TwelveLabsClient({ apiKey: process.env.TEST_API_KEY });
    
    // Create test index
    const index = await client.indexes.create({
      name: `Test Index ${Date.now()}`,
      engines: [{ name: 'marengo2.6', options: ['visual', 'conversation'] }]
    });
    indexId = index.id;
  });
  
  it('should complete full workflow', async () => {
    // Upload video
    const video = await client.videos.upload({
      indexId,
      url: 'https://example.com/test-video.mp4'
    });
    videoId = video.id;
    
    // Wait for indexing
    await waitForVideoIndexing(client, indexId, videoId);
    
    // Search
    const results = await client.search.query({
      indexId,
      query: 'person walking',
      options: ['visual']
    });
    
    expect(results.data).toHaveLength(0); // or > 0 depending on test video
  });
  
  afterAll(async () => {
    await client.indexes.delete(indexId);
  });
});
```

---

## Documentation Requirements

### 1. Installation Guide
```markdown
## Installation

npm install @twelvelabs/sdk

# or
yarn add @twelvelabs/sdk

# or
pnpm add @twelvelabs/sdk
```

### 2. Quick Start
```typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

const client = new TwelveLabsClient({
  apiKey: 'YOUR_API_KEY'
});

// Create an index
const index = await client.indexes.create({
  name: 'My First Index',
  engines: [
    {
      name: 'marengo2.6',
      options: ['visual', 'conversation']
    }
  ]
});

// Upload a video
const video = await client.videos.upload({
  indexId: index.id,
  url: 'https://example.com/video.mp4'
});

// Search
const results = await client.search.query({
  indexId: index.id,
  query: 'person walking a dog',
  options: ['visual']
});
```

### 3. Advanced Examples
- Batch processing
- Error handling patterns
- Pagination helpers
- Custom retry logic
- Webhook integration

---

## Quality Metrics

### Code Quality
- [ ] ESLint: No errors
- [ ] Prettier: All files formatted
- [ ] TypeScript: Strict mode, no `any` types
- [ ] Bundle size: < 100KB gzipped
- [ ] Tree-shakeable: Yes

### Test Coverage
- [ ] Unit tests: 95%+
- [ ] Integration tests: All critical paths
- [ ] E2E tests: Main workflows
- [ ] Error scenarios: All HTTP error codes

### Documentation
- [ ] API reference: 100% coverage
- [ ] Examples: All major features
- [ ] CodeSandbox: All examples working
- [ ] Migration guide: Complete
- [ ] Troubleshooting: Common issues

### Performance
- [ ] Request latency: < 100ms overhead
- [ ] Memory usage: Minimal
- [ ] Bundle size: Optimized
- [ ] No memory leaks

---

## Release Checklist

### Pre-release
- [ ] All tests passing
- [ ] Coverage requirements met
- [ ] Documentation reviewed
- [ ] Examples tested
- [ ] Security audit
- [ ] Performance benchmarks
- [ ] Changelog updated

### Release
- [ ] Version bump (semantic versioning)
- [ ] Git tag created
- [ ] NPM package published
- [ ] GitHub release created
- [ ] Documentation deployed
- [ ] Announcement prepared

### Post-release
- [ ] Monitor for issues
- [ ] Respond to feedback
- [ ] Update examples if needed
- [ ] Plan next iteration

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|------------|
| 1. Project Setup | Week 1 | Repository with build pipeline |
| 2. Core Architecture | Week 1-2 | HTTP client, auth, base classes |
| 3. API Endpoints | Week 2-4 | All endpoints implemented |
| 4. Type Definitions | Week 3-4 | Complete TypeScript types |
| 5. Testing | Week 4-5 | 90%+ coverage, all tests passing |
| 6. Documentation | Week 5-6 | API docs, guides, examples |
| 7. CodeSandbox | Week 6 | Interactive examples |
| 8. NPM Preparation | Week 7 | Package ready for release |
| 9. Validation | Week 7 | Final QA, test dashboard |

**Total Duration: 7 weeks**

---

## Success Criteria

✅ All Twelve Labs API v1.3 endpoints implemented  
✅ TypeScript with full type safety  
✅ 90%+ test coverage  
✅ All tests documented with pass/fail status  
✅ Comprehensive documentation (TypeDoc)  
✅ **Minimal public API surface** - only essential classes/types exposed  
✅ **Internal implementation hidden** - users see clean, simple interface  
✅ **Documentation shows only public API** - no internal complexity  
✅ Working CodeSandbox examples for all major features  
✅ NPM package published  
✅ CI/CD pipeline configured  
✅ Performance benchmarks meet targets  
✅ Security best practices followed  
✅ **Version synchronization fully automated** (code = docs = tests = examples)  
✅ **Multi-version documentation hosting** with version selector  
✅ **Automated version validation** in CI/CD  
✅ **Git tags match NPM versions**  
✅ **CHANGELOG maintained** for all versions  
✅ **Public API surface tested** - no accidental internal exports  

---

## Version Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Action                          │
│              npm version patch/minor/major                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              package.json updated                            │
│              version: "1.2.0" → "1.3.0"                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              npm run version:sync                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. src/version.ts         → VERSION = '1.3.0'        │  │
│  │ 2. docs/index.md          → Version: 1.3.0           │  │
│  │ 3. typedoc.json           → SDK v1.3.0               │  │
│  │ 4. README.md              → version badge            │  │
│  │ 5. examples/**/package.json → "@twelvelabs/sdk": "1.3.0" │  │
│  │ 6. tests/metadata.json    → version: "1.3.0"         │  │
│  │ 7. CHANGELOG.md           → ## [1.3.0]               │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              git commit && git tag v1.3.0                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              git push --tags                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         GitHub Actions: Release Workflow Triggered           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Verify: tag version === package.json version      │  │
│  │ 2. Run: npm run version:verify                       │  │
│  │ 3. Build: npm run build                              │  │
│  │ 4. Test: npm run test:all                            │  │
│  │ 5. Publish: npm publish                              │  │
│  │ 6. Build docs: npm run docs:build                    │  │
│  │ 7. Deploy docs: /v1.3.0/ + update /latest            │  │
│  │ 8. Create GitHub Release with changelog              │  │
│  │ 9. Update CodeSandbox examples                       │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Version Released!                         │
│  • NPM: @twelvelabs/sdk@1.3.0                               │
│  • Docs: https://yourorg.github.io/sdk/v1.3.0              │
│  • Docs: https://yourorg.github.io/sdk/latest (updated)    │
│  • GitHub: Release v1.3.0 with notes                        │
│  • CodeSandbox: Examples updated                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Version Tracking File Structure

```
twelvelabs-sdk/
├── package.json                    # ← SINGLE SOURCE OF TRUTH
│   └── version: "1.3.0"
│
├── src/
│   ├── version.ts                  # ← Auto-generated from package.json
│   │   └── export const VERSION = '1.3.0'
│   └── index.ts
│
├── docs/
│   ├── index.md                    # ← Version header
│   │   └── "Version: 1.3.0"
│   ├── versions.json               # ← Version registry
│   │   └── { latest: "1.3.0", versions: [...] }
│   └── v1.3.0/                     # ← Version-specific docs
│       ├── api/
│       └── guides/
│
├── tests/
│   └── metadata.json               # ← Test version tracking
│       └── { version: "1.3.0", lastUpdated: "..." }
│
├── examples/
│   └── codesandbox/
│       └── basic-search/
│           └── package.json        # ← Pinned SDK version
│               └── "@twelvelabs/sdk": "1.3.0"
│
├── CHANGELOG.md                    # ← Version history
│   └── ## [1.3.0] - 2024-02-05
│
├── typedoc.json                    # ← Docs title
│   └── name: "Twelve Labs SDK v1.3.0"
│
└── scripts/
    ├── sync-versions.js            # ← Master sync script
    ├── verify-version-sync.js      # ← CI validation
    └── validate-release.js         # ← Pre-release checks
```  

---

## Next Steps

1. **Review this plan** - Adjust timeline and priorities as needed
2. **Set up repository** - Initialize with basic structure
3. **Start Phase 1** - Project setup and tooling
4. **Weekly check-ins** - Track progress against milestones
5. **Iterate and improve** - Refine based on learnings

Would you like me to help you get started with any specific phase?
