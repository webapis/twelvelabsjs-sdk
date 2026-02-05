# Twelve Labs JavaScript SDK

[![npm version](https://img.shields.io/npm/v/@twelvelabs/sdk.svg)](https://www.npmjs.com/package/@twelvelabs/sdk)
[![License](https://img.shields.io/npm/l/@twelvelabs/sdk.svg)](LICENSE)

Official JavaScript SDK for the [Twelve Labs](https://twelvelabs.io) Video Understanding Platform.

**Current Version:** 0.1.0  
**API Version:** v1.3  

## Features

- ✅ **Simple & Intuitive** - Clean, minimal API surface
- ✅ **Type-Safe** - Full TypeScript support with comprehensive types
- ✅ **Well-Documented** - Extensive JSDoc comments and guides
- ✅ **Modern** - ESM and CommonJS support
- ✅ **Reliable** - Automatic retries and error handling
- ✅ **Tested** - Comprehensive test coverage

## Installation

```bash
npm install @twelvelabs/sdk
```

## Quick Start

```typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

// Initialize the client
const client = new TwelveLabsClient({
  apiKey: 'YOUR_API_KEY'
});

// Create an index
const index = await client.indexes.create({
  name: 'My Videos',
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
  file: myVideoFile,
  onProgress: (progress) => {
    console.log(`Upload: ${progress.percentage}%`);
  }
});

// Search your videos
const results = await client.search.query({
  indexId: index.id,
  query: 'person walking a dog',
  options: ['visual']
});

console.log(`Found ${results.data.length} results`);
```

## Documentation

- **[API Reference](https://yourorg.github.io/twelvelabs-sdk/latest/api)** - Complete API documentation
- **[Getting Started Guide](https://yourorg.github.io/twelvelabs-sdk/latest/guides/getting-started)** - Step-by-step tutorial
- **[Examples](./examples)** - CodeSandbox examples

## Core Concepts

### TwelveLabsClient

The main entry point for all SDK operations:

```typescript
const client = new TwelveLabsClient({
  apiKey: 'your-api-key',
  timeout: 60000,     // Optional: request timeout in ms
  maxRetries: 3,      // Optional: max retry attempts
  debug: false        // Optional: enable debug logging
});
```

### Resources

All API operations are organized into resource objects:

- **`client.indexes`** - Manage video indexes
- **`client.videos`** - Upload and manage videos  
- **`client.search`** - Search your videos
- **`client.embeddings`** - Generate embeddings
- **`client.tasks`** - Async tasks (summarize, classify, etc.)
- **`client.entities`** - Extract entities from videos

### Error Handling

```typescript
import { 
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError 
} from '@twelvelabs/sdk';

try {
  await client.indexes.create({ ... });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof ValidationError) {
    console.log('Invalid parameters:', error.details);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited. Retry after:', error.retryAfter);
  }
}
```

## Examples

### Index Management

```typescript
// Create an index
const index = await client.indexes.create({
  name: 'Product Videos',
  engines: [
    { name: 'marengo2.6', options: ['visual', 'conversation', 'text_in_video'] }
  ],
  addons: ['thumbnail']
});

// List indexes
const { data: indexes } = await client.indexes.list({
  page: 1,
  page_limit: 10
});

// Get an index
const index = await client.indexes.get('index_id');

// Update an index
await client.indexes.update('index_id', { name: 'New Name' });

// Delete an index
await client.indexes.delete('index_id');
```

### Video Upload

```typescript
// Upload from file
const video = await client.videos.upload({
  indexId: 'index_id',
  file: videoFile,
  onProgress: (p) => console.log(`${p.percentage}%`)
});

// Upload from URL
const video = await client.videos.upload({
  indexId: 'index_id',
  url: 'https://example.com/video.mp4'
});
```

### Search

```typescript
const results = await client.search.query({
  indexId: 'index_id',
  query: 'person wearing red shirt',
  options: ['visual', 'conversation']
});

results.data.forEach(result => {
  console.log(`Score: ${result.score}`);
  console.log(`Video: ${result.video_id}`);
});
```

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.5 (for TypeScript users)

## Version Compatibility

| SDK Version | API Version | Node.js | Status |
|-------------|-------------|---------|--------|
| 0.1.x       | v1.3        | >=16    | ✅ Active |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@twelvelabs.io
- 💬 Discord: [Join our community](https://discord.com/invite/twelvelabs)
- 📖 Docs: [docs.twelvelabs.io](https://docs.twelvelabs.io)
- 🐛 Issues: [GitHub Issues](https://github.com/twelvelabs-io/twelvelabs-js/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ by [Twelve Labs](https://twelvelabs.io)
