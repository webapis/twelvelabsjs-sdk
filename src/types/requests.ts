export interface CreateIndexParams {
  name: string;
  engines: {
    name: string;
    options: string[];
  }[];
  addons?: string[];
}

export interface UpdateIndexParams {
  name: string;
}

export interface ListIndexesParams {
  page?: number;
  page_limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name';
  sort_option?: 'asc' | 'desc';
}
