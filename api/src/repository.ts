export const PageLimit = 20;

export interface Page<T> {
  data: T[];
  offset: number;
  nextOffset: number;
}

export interface Repository<T> {
  create(data: Partial<T>): Promise<T>;

  createMany(data: Partial<T>[]): Promise<T[]>;

  findById(id: string): Promise<T | null>;

  find(filter: any, projection?: any, options?: any): Promise<T[]>;

  update(filter: any, update: any): Promise<number>;

  findOne(
    filter: any,
    projection?: any,
    options?: any,
  ): Promise<T | null | undefined>;

  paginate(
    filter: any,
    offset?: number,
    projection?: any,
    options?: any,
  ): Promise<any>;

  findAll(): Promise<T[]>;

  updateById(id: string, data: Partial<T>): Promise<T | null | undefined>;

  delete(id: string): Promise<T | null>;
}
