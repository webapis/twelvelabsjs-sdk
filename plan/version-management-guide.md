# Version Management Guide - Twelve Labs JavaScript SDK

## Overview

This guide explains how version synchronization works across all SDK components to ensure code, documentation, tests, and examples always match.

---

## Core Principle: Single Source of Truth

**`package.json` is the ONLY place where version is manually set.**

All other files derive their version from `package.json` through automated scripts.

---

## Version Synchronization Map

| Component | Location | Update Method | Updated By |
|-----------|----------|---------------|------------|
| **Code** | `package.json` | Manual | Developer |
| **Source Code Constant** | `src/version.ts` | Auto-generated | `scripts/build-version.js` |
| **Documentation Header** | `docs/index.md` | Auto-replaced | `scripts/inject-version-to-docs.js` |
| **API Docs Title** | `typedoc.json` | Auto-replaced | `scripts/inject-version-to-docs.js` |
| **README Badges** | `README.md` | Auto-replaced | `scripts/inject-version-to-docs.js` |
| **CodeSandbox Examples** | `examples/**/package.json` | Auto-replaced | `scripts/update-codesandbox-versions.js` |
| **Test Metadata** | `tests/metadata.json` | Auto-replaced | `scripts/sync-versions.js` |
| **Version Registry** | `docs/versions.json` | Manual/CI | Developer/GitHub Actions |
| **Changelog** | `CHANGELOG.md` | Semi-auto | `scripts/sync-versions.js` (structure) + Developer (content) |

---

## Developer Workflow

### Making a New Release

#### 1. Update Code & Tests
```bash
# Make your changes
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
```

#### 2. Bump Version
```bash
# For bug fixes (1.2.0 → 1.2.1)
npm run version:bump:patch

# For new features (1.2.1 → 1.3.0)
npm run version:bump:minor

# For breaking changes (1.3.0 → 2.0.0)
npm run version:bump:major
```

This only updates `package.json` - nothing else yet.

#### 3. Sync All Versions
```bash
npm run version:sync
```

This script automatically updates:
- ✅ `src/version.ts`
- ✅ Documentation files
- ✅ TypeDoc config
- ✅ README badges
- ✅ CodeSandbox examples
- ✅ Test metadata
- ✅ CHANGELOG template (you'll fill in details)

#### 4. Update CHANGELOG
Edit `CHANGELOG.md` and fill in the details for the new version:

```markdown
## [1.3.0] - 2024-02-05

### Added
- New video analysis endpoint
- Support for batch embeddings

### Changed
- Improved error handling for rate limits

### Fixed
- Fixed pagination bug in search results
```

#### 5. Commit Version Changes
```bash
git add .
git commit -m "chore: bump version to 1.3.0"
```

#### 6. Create Git Tag
```bash
git tag v1.3.0
```

The tag MUST match the version in `package.json` (with `v` prefix).

#### 7. Push to GitHub
```bash
git push origin main
git push origin v1.3.0
```

#### 8. GitHub Actions Takes Over
The push of the tag triggers the release workflow which:
- ✅ Verifies tag matches package.json
- ✅ Runs version sync verification
- ✅ Builds the package
- ✅ Runs all tests
- ✅ Publishes to NPM
- ✅ Builds documentation
- ✅ Deploys docs to `/v1.3.0/` and updates `/latest`
- ✅ Creates GitHub Release
- ✅ Updates CodeSandbox examples

---

## Scripts Reference

### `npm run version:bump:patch`
Increments patch version (1.2.0 → 1.2.1)

### `npm run version:bump:minor`
Increments minor version (1.2.0 → 1.3.0)

### `npm run version:bump:major`
Increments major version (1.2.0 → 2.0.0)

### `npm run version:sync`
Synchronizes version from package.json to all other files

### `npm run version:verify`
Checks that all versions are in sync (used in CI)

### `npm run version:info`
Displays current version information

---

## Automated Scripts Explained

### 1. `scripts/build-version.js`
**Purpose:** Generates `src/version.ts` from `package.json`

**Input:** `package.json` version field

**Output:** `src/version.ts`
```typescript
export const VERSION = '1.3.0';
export const API_VERSION = 'v1.3';
export const USER_AGENT = 'twelvelabs-js-sdk/1.3.0';
```

**When Run:** 
- Before build (`prebuild` script)
- During version sync

---

### 2. `scripts/inject-version-to-docs.js`
**Purpose:** Updates version strings in documentation files

**Files Updated:**
- `docs/index.md` - Header version
- `typedoc.json` - API docs title
- `README.md` - Version badges

**Example Replacement:**
```markdown
<!-- Before -->
Version: 1.2.0

<!-- After -->
Version: 1.3.0
```

**When Run:** 
- During version sync
- Before docs build

---

### 3. `scripts/update-codesandbox-versions.js`
**Purpose:** Updates SDK version in all CodeSandbox examples

**Files Updated:**
- `examples/codesandbox/*/package.json`

**Example:**
```json
{
  "dependencies": {
    "@twelvelabs/sdk": "1.3.0"  // Updated
  }
}
```

**When Run:**
- During version sync
- After NPM publish (in CI)

---

### 4. `scripts/sync-versions.js`
**Purpose:** Master orchestration script that runs all version updates

**Calls:**
1. `build-version.js`
2. `inject-version-to-docs.js`
3. `update-codesandbox-versions.js`
4. Updates `tests/metadata.json`
5. Creates CHANGELOG template (if needed)

**When Run:**
- Manually: `npm run version:sync`
- Automatically: `prebuild`, `predocs`, `prerelease`

---

### 5. `scripts/verify-version-sync.js`
**Purpose:** Validates all versions are synchronized

**Checks:**
- ✅ `src/version.ts` matches `package.json`
- ✅ `docs/index.md` matches `package.json`
- ✅ `tests/metadata.json` matches `package.json`
- ✅ README badges reference correct version

**Exit Codes:**
- 0: All versions synchronized ✅
- 1: Version mismatch found ❌

**When Run:**
- In CI on every PR
- Before release
- Manually: `npm run version:verify`

---

### 6. `scripts/validate-release.js`
**Purpose:** Pre-release validation checklist

**Validates:**
- ✅ Git tag exists and matches version
- ✅ CHANGELOG has entry for version
- ✅ All versions synchronized
- ✅ All tests pass
- ✅ Coverage meets threshold (90%)
- ✅ Build succeeds

**When Run:**
- Manually before release: `npm run release:validate`
- Automatically in release workflow

---

## Version Registry (`docs/versions.json`)

Maintains a list of all published versions for documentation version selector.

```json
{
  "latest": "1.3.0",
  "versions": [
    {
      "version": "1.3.0",
      "released": "2024-02-05",
      "status": "stable",
      "docs_url": "/v1.3.0",
      "breaking_changes": false,
      "deprecations": []
    },
    {
      "version": "1.2.0",
      "released": "2024-01-15",
      "status": "maintenance",
      "docs_url": "/v1.2.0",
      "breaking_changes": false,
      "end_of_life": "2024-07-15"
    }
  ],
  "deprecated": [
    {
      "version": "1.0.0",
      "deprecated_date": "2024-02-01",
      "reason": "Superseded by v1.2.0",
      "migration_guide": "/migration/v1.0-to-v1.2"
    }
  ]
}
```

**Update Process:**
1. Automatically updated by release workflow
2. Status changes require manual edit
3. Deprecation notices added manually

---

## Documentation Versioning

### Directory Structure
```
docs/
├── versions.json           # Version registry
├── latest/                 # Symlink → v1.3.0
├── v1.3.0/                # Current stable
│   ├── api/               # TypeDoc output
│   ├── guides/
│   ├── examples/
│   └── migration/
├── v1.2.0/                # Previous version
│   └── ...
└── v1.1.0/                # Older version
    └── ...
```

### Version Selector
Every documentation page includes a version selector:

```html
<select id="version-selector">
  <option value="/latest">Latest (v1.3.0)</option>
  <option value="/v1.3.0">v1.3.0 (Stable)</option>
  <option value="/v1.2.0">v1.2.0 (Maintenance)</option>
  <option value="/v1.1.0">v1.1.0 (EOL)</option>
</select>
```

### Deployment
GitHub Actions deploys docs to:
- `/v{VERSION}/` - Permanent version URL
- `/latest/` - Updated to point to newest stable

---

## CI/CD Version Validation

### Pull Request Workflow
```yaml
- name: Verify version sync
  run: npm run version:verify
```

Ensures no one commits with mismatched versions.

### Release Workflow
```yaml
- name: Extract version from tag
  run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

- name: Verify tag matches package.json
  run: |
    TAG_VERSION=${{ steps.extract_version.outputs.VERSION }}
    PKG_VERSION=$(node -p "require('./package.json').version")
    if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
      echo "Mismatch! Tag: $TAG_VERSION, Package: $PKG_VERSION"
      exit 1
    fi
```

Prevents publishing with wrong version.

---

## Common Scenarios

### Scenario 1: Forgot to Sync Versions
**Problem:** Made changes but forgot to run `version:sync`

**Solution:**
```bash
npm run version:sync
git add .
git commit --amend --no-edit
```

---

### Scenario 2: Wrong Git Tag
**Problem:** Created tag v1.3.0 but package.json says 1.2.0

**Solution:**
```bash
# Delete wrong tag
git tag -d v1.3.0
git push origin :refs/tags/v1.3.0

# Fix version
npm run version:bump:minor
npm run version:sync
git add .
git commit -m "chore: bump to 1.3.0"

# Create correct tag
git tag v1.3.0
git push origin main --tags
```

---

### Scenario 3: Need to Fix Deployed Docs
**Problem:** Found typo in v1.3.0 docs after release

**Solution:**
```bash
# Fix the docs
vim docs/guides/getting-started.md
git commit -m "docs: fix typo"

# Re-deploy same version docs
npm run docs:build
npm run docs:deploy -- --version 1.3.0

# No version bump needed for doc-only fixes
```

---

### Scenario 4: Hotfix Release
**Problem:** Critical bug in 1.3.0, need 1.3.1 ASAP

**Solution:**
```bash
# Create hotfix branch
git checkout -b hotfix/1.3.1

# Fix bug
# ... make changes ...
git commit -m "fix: critical bug"

# Version bump
npm run version:bump:patch  # 1.3.0 → 1.3.1
npm run version:sync
git commit -m "chore: bump to 1.3.1"

# Tag and push
git tag v1.3.1
git push origin hotfix/1.3.1 --tags

# Merge to main
git checkout main
git merge hotfix/1.3.1
git push
```

---

## Version Display in SDK

Users can check SDK version:

```typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

// Static property
console.log(TwelveLabsClient.VERSION);  // "1.3.0"

// Instance method
const client = new TwelveLabsClient({ apiKey: '...' });
console.log(client.getVersion());  // "1.3.0"
```

This is automatically included in User-Agent header:
```
User-Agent: twelvelabs-js-sdk/1.3.0
```

---

## Troubleshooting

### Version verification fails in CI
**Cause:** Files not synchronized

**Fix:**
```bash
npm run version:sync
git add .
git commit -m "chore: sync versions"
git push
```

---

### NPM publish fails
**Cause:** Version already published

**Check:**
```bash
npm view @twelvelabs/sdk versions
```

**Fix:** Bump to next version

---

### Documentation not updating
**Cause:** Build cache

**Fix:**
```bash
rm -rf docs-build
npm run docs:build
```

---

## Best Practices

### ✅ DO:
- Always run `version:sync` after bumping version
- Verify with `version:verify` before committing
- Use semantic versioning
- Update CHANGELOG for every version
- Test before tagging
- Use `v` prefix in git tags (v1.3.0)

### ❌ DON'T:
- Manually edit `src/version.ts`
- Skip `version:sync`
- Create tags without matching package.json
- Publish without running tests
- Reuse version numbers
- Skip CHANGELOG updates

---

## Semantic Versioning Guide

Given version number MAJOR.MINOR.PATCH (e.g., 1.2.3):

**MAJOR** (1.x.x → 2.x.x)
- Breaking changes
- API incompatibilities
- Requires migration guide

**MINOR** (x.2.x → x.3.x)
- New features
- Backwards compatible
- New endpoints
- New optional parameters

**PATCH** (x.x.3 → x.x.4)
- Bug fixes
- Performance improvements
- Documentation updates
- No new features

---

## Migration Guide Template

When releasing breaking changes, create migration guide:

```markdown
# Migration Guide: v1.x to v2.0

## Breaking Changes

### 1. Authentication Method Changed
**Before (v1.x):**
\`\`\`typescript
const client = new TwelveLabsClient('api-key');
\`\`\`

**After (v2.0):**
\`\`\`typescript
const client = new TwelveLabsClient({ apiKey: 'api-key' });
\`\`\`

### 2. Search Method Signature
**Before:** ...
**After:** ...

## Deprecated Features
- `client.search()` - Use `client.search.query()` instead
- ...

## New Features
- Multi-index search
- Batch operations
- ...
```

---

## Summary

**The version management system ensures:**
1. ✅ Code version always matches published package
2. ✅ Documentation always reflects current version
3. ✅ Examples work with published version
4. ✅ Tests track which version they validate
5. ✅ Users can access docs for any version
6. ✅ CI/CD prevents version mismatches
7. ✅ Zero manual synchronization required

**Single command to rule them all:**
```bash
npm run version:sync
```
