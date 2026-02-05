import { HttpClient } from '../../../src/internal/http-client';
import { Indexes } from '../../../src/resources/indexes';
import {
  CreateIndexParams,
  ListIndexesParams,
  UpdateIndexParams,
} from '../../../src/types/requests';
import { Index, PaginatedIndexes } from '../../../src/types/responses';

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

  describe('list', () => {
    it('should list indexes with pagination', async () => {
      const params: ListIndexesParams = { page: 1, page_limit: 10 };
      const mockResponse: PaginatedIndexes = {
        data: [],
        page_info: {
          limit_per_page: 10,
          page: 1,
          total_page: 1,
          total_result: 0,
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await indexes.list(params);

      expect(result).toEqual(mockResponse);
      expect(httpClient.get).toHaveBeenCalledWith('/indexes', { params });
    });
  });

  describe('get', () => {
    it('should get an index by ID', async () => {
      const indexId = 'idx_123';
      const mockResponse: Index = {
        id: indexId,
        name: 'Test Index',
        engines: [],
        created_at: new Date().toISOString(),
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await indexes.get(indexId);

      expect(result).toEqual(mockResponse);
      expect(httpClient.get).toHaveBeenCalledWith(`/indexes/${indexId}`);
    });
  });

  describe('update', () => {
    it('should update an index', async () => {
      const indexId = 'idx_123';
      const params: UpdateIndexParams = { name: 'New Name' };
      const mockResponse: Index = {
        id: indexId,
        name: 'New Name',
        engines: [],
        created_at: new Date().toISOString(),
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await indexes.update(indexId, params);

      expect(result).toEqual(mockResponse);
      expect(httpClient.put).toHaveBeenCalledWith(`/indexes/${indexId}`, params);
    });
  });

  describe('delete', () => {
    it('should delete an index', async () => {
      const indexId = 'idx_123';
      httpClient.delete.mockResolvedValue(undefined);

      await indexes.delete(indexId);

      expect(httpClient.delete).toHaveBeenCalledWith(`/indexes/${indexId}`);
    });
  });
});
