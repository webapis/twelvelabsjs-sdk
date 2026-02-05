import { PaginatedResponse } from './common';

export interface Index {
  id: string;
  name: string;
  engines: {
    name: string;
    options: string[];
  }[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedIndexes extends PaginatedResponse<Index> {}
