import { BaseResource } from '../internal/base-resource';
import {
  CreateIndexParams,
  ListIndexesParams,
  UpdateIndexParams,
} from '../types/requests';
import { Index, PaginatedIndexes } from '../types/responses';

export class Indexes extends BaseResource {
  /**
   * Creates a new index for organizing and searching videos
   * 
   * @param params - Configuration for the new index
   * @returns Promise resolving to the created index
   * @throws {ValidationError} If parameters are invalid
   */
  public async create(params: CreateIndexParams): Promise<Index> {
    const { name, ...rest } = params;
    const payload = { index_name: name, ...rest };
    return this.client.post<Index>('/indexes', payload);
  }

  /**
   * Lists all indexes with pagination
   * 
   * @param params - Pagination and sorting options
   * @returns Promise resolving to a paginated list of indexes
   */
  public async list(params?: ListIndexesParams): Promise<PaginatedIndexes> {
    return this.client.get<PaginatedIndexes>('/indexes', { params });
  }

  /**
   * Retrieves a specific index by ID
   * 
   * @param indexId - The ID of the index to retrieve
   * @returns Promise resolving to the index details
   * @throws {NotFoundError} If the index does not exist
   */
  public async get(indexId: string): Promise<Index> {
    return this.client.get<Index>(`/indexes/${indexId}`);
  }

  /**
   * Updates an existing index
   * 
   * @param indexId - The ID of the index to update
   * @param params - The new configuration for the index
   * @returns Promise resolving to the updated index
   * @throws {NotFoundError} If the index does not exist
   */
  public async update(indexId: string, params: UpdateIndexParams): Promise<Index> {
    const { name, ...rest } = params;
    const payload = { index_name: name, ...rest };
    return this.client.put<Index>(`/indexes/${indexId}`, payload);
  }

  /**
   * Deletes an index
   * 
   * @param indexId - The ID of the index to delete
   * @returns Promise resolving when the index is deleted
   * @throws {NotFoundError} If the index does not exist
   */
  public async delete(indexId: string): Promise<void> {
    await this.client.delete<void>(`/indexes/${indexId}`);
  }
}
