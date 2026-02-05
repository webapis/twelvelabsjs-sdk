export interface Index {
  id: string;
  name: string;
  engines: {
    name: string;
    options: string[];
  }[];
  created_at: string;
}
