import { TwelveLabsClient } from '../../src';
import * as fs from 'fs';
import * as path from 'path';

// Simple helper to load .env file
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf-8');
      envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key.trim()]) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (e) {
    // Ignore error if .env doesn't exist
  }
}

describe('Indexes Integration Tests', () => {
  let client: TwelveLabsClient;

  beforeAll(() => {
    loadEnv();
    const apiKey = process.env.TWELVE_LABS_API_KEY;
    if (!apiKey) {
      throw new Error(
        'TWELVE_LABS_API_KEY environment variable is not set. Please set it or create a .env file in the root directory.'
      );
    }
    client = new TwelveLabsClient({ apiKey });
  });

  // Use a unique index name for each test run to avoid conflicts
  const indexName = `test-index-${Date.now()}`;
  let indexId: string;

  it('should create, retrieve, and delete an index', async () => {
    // 1. Create the index
    const createResult = await client.indexes.create({
      name: indexName,
      engines: [
        {
          name: 'marengo3.0',
          options: ['visual', 'audio'],
        },
      ],
    });

    // The create method might return a minimal object, so we only check for the ID here.
    expect(createResult.id).toBeDefined();
    indexId = createResult.id;

    // 2. Get the full index to verify its properties
    const index = await client.indexes.get(indexId);
    expect(index.name).toBe(indexName);
    expect(index.id).toBe(indexId);
    expect(index.engines).toHaveLength(1);
    expect(index.engines[0].name).toBe('marengo3.0');

    // 3. Cleanup: Delete the index
    try {
      await client.indexes.delete(indexId);
    } catch (e) {
      console.error(`Cleanup failed for index ${indexId}:`, e);
      throw new Error(`Failed to delete index ${indexId} during cleanup.`);
    }
  }, 30000); // Increase timeout for API calls
});
