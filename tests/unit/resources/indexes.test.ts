import { HttpClient } from '../../../src/internal/http-client';
import { Indexes } from '../../../src/resources/indexes';
import { CreateIndexParams } from '../../../src/types/requests';
import { Index } from '../../../src/types/responses';

// Mock the HttpClient
jest.mock('../../../src/internal/http-client');

describe('Indexes Resource', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let indexes: Indexes;

  beforeEach(() => {
    httpClient = new (HttpClient as jest.Mock<HttpClient>)({ apiKey: 'test' });
    indexes = new Indexes(httpClient);
  });

  describe('create', () => {
    it('should create an index with valid parameters', async () => {
      const params: CreateIndexParams = {
        name: 'Test Index',
        engines: [{ name: 'marengo2.6', options: ['visual'] }],
      };
      const mockResponse: Index = {
        id: 'idx_123',
        name: 'Test Index',
        engines: [{ name: 'marengo2.6', options: ['visual'] }],
        created_at: new Date().toISOString(),
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await indexes.create(params);

      expect(result).toEqual(mockResponse);
      expect(httpClient.post).toHaveBeenCalledWith('/indexes', params);
    });
  });
});
