export interface PageInfo {
  limit_per_page: number;
  page: number;
  total_page: number;
  total_result: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page_info: PageInfo;
}
