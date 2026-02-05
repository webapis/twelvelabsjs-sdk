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

  it('should create a new index and then delete it', async () => {
    // Create
    const index = await client.indexes.create({
      name: indexName,
      engines: [
        {
          name: 'marengo2.6',
          options: ['visual', 'conversation'],
        },
      ],
    });
    indexId = index.id;

    expect(index.name).toBe(indexName);
    expect(index.id).toBeDefined();

    // Cleanup: Delete the index
    // A try-catch is used to ensure cleanup happens even if assertions fail
    try {
      await client.indexes.delete(indexId);
    } catch (e) {
      console.error(`Cleanup failed for index ${indexId}:`, e);
      throw new Error(`Failed to delete index ${indexId} during cleanup.`);
    }
  }, 30000); // Increase timeout for API calls
});
