export declare class PageParamsDto {
  offset?: number;
}

export const PageLimit = 20;

export interface Page<T> {
  data: T[];
  offset: number;
  nextOffset: number;
}
