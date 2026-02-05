import { BaseResource } from '../internal/base-resource';
import { CreateIndexParams } from '../types/requests';
import { Index } from '../types/responses';

export class Indexes extends BaseResource {
  /**
   * Creates a new index for organizing and searching videos
   * 
   * @param params - Configuration for the new index
   * @returns Promise resolving to the created index
   * @throws {ValidationError} If parameters are invalid
   */
  public async create(params: CreateIndexParams): Promise<Index> {
    return this.client.post<Index>('/indexes', params);
  }
}
