export interface CreateIndexParams {
  name: string;
  engines: {
    name: string;
    options: string[];
  }[];
  addons?: string[];
}
