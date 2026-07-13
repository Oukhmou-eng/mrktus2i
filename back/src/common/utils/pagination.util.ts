export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationOffset({ page = 1, limit = 20 }: PaginationParams) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
