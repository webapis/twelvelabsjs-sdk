import { BaseResource } from '../internal/base-resource';
import {
  CreateIndexParams,
  ListIndexesParams,
  UpdateIndexParams,
} from '../types/requests';
import { Index, PaginatedIndexes } from '../types/responses';

export class Indexes extends BaseResource {
  private normalizeIndex(response: any): Index {
    if (!response) return response;
    return {
      id: response._id,
      name: response.index_name,
      engines: (response.models || []).map((model: any) => ({
        name: model.model_name,
        options: model.model_options, // Corrected from model.options
      })),
      created_at: response.created_at,
      updated_at: response.updated_at,
    };
  }

  public async create(params: CreateIndexParams): Promise<Index> {
    const { name, engines, ...rest } = params;
    const payload = {
      index_name: name,
      models: engines.map((engine) => ({
        model_name: engine.name,
        model_options: engine.options, // Corrected from options
      })),
      ...rest,
    };
    const response = await this.client.post<any>('/indexes', payload);
    return this.normalizeIndex(response);
  }

  public async list(params?: ListIndexesParams): Promise<PaginatedIndexes> {
    const response = await this.client.get<any>('/indexes', { params });
    return {
      ...response,
      data: response.data.map((item: any) => this.normalizeIndex(item)),
    };
  }

  public async get(indexId: string): Promise<Index> {
    const response = await this.client.get<any>(`/indexes/${indexId}`);
    return this.normalizeIndex(response);
  }

  public async update(
    indexId: string,
    params: UpdateIndexParams
  ): Promise<Index> {
    const { name, ...rest } = params;
    const payload = { index_name: name, ...rest };
    const response = await this.client.put<any>(`/indexes/${indexId}`, payload);
    return this.normalizeIndex(response);
  }

  public async delete(indexId: string): Promise<void> {
    await this.client.delete<void>(`/indexes/${indexId}`);
  }
}
