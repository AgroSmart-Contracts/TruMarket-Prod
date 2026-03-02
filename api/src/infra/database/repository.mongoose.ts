import {
  Error,
  type FilterQuery,
  type Model,
  type ProjectionType,
  type QueryOptions,
  UpdateQuery,
} from 'mongoose';

import { ConflictError } from '../../errors';
import { Page, PageLimit } from '../../repository';

export class MongooseRepository<T> {
  constructor(private readonly model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const inserted = await this.model.create(data);
      return inserted.toJSON();
    } catch (err) {
      switch (err.name) {
        case Error.ValidationError.name:
          throw new ConflictError(err.message);
        default:
          throw err;
      }
    }
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    try {
      const inserted = await this.model.insertMany(data);
      return inserted ? inserted.map((u) => (u as any).toJSON()) : [];
    } catch (err) {
      switch (err.name) {
        case Error.ValidationError.name:
          throw new ConflictError(err.message);
        default:
          throw err;
      }
    }
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id);

    return doc ? doc.toJSON() : null;
  }

  // async findByIds(ids: string[]): Promise<T[]> {
  //   const docs = await this.model.find({ _id: { $in: ids } });

  //   return docs;
  // }

  async find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    const docs = await this.model.find(filter, projection, options);
    const jsonDocs = docs ? docs.map((u) => (u as any).toJSON()) : [];
    return jsonDocs;
  }

  async update(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<number> {
    const docs = await this.model.updateMany(filter, update);
    return docs.modifiedCount;
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null | undefined> {
    const doc = await this.model.findOne(filter, projection, options);
    return doc ? doc.toJSON() : null;
  }

  async paginate(
    filter: FilterQuery<T>,
    offset: number = 0,
    projection: ProjectionType<T> = {},
    options: QueryOptions<T> = {},
  ): Promise<Page<T>> {
    options.limit = PageLimit;
    options.skip = offset;
    const data = await this.find(filter, projection, options);

    return {
      data,
      offset,
      nextOffset: data.length < PageLimit ? 0 : offset + 20,
    };
  }

  async findAll(): Promise<T[]> {
    const docs = await this.model.find();

    return docs ? docs.map((u) => u.toJSON() as T) : [];
  }

  async updateById(
    id: string,
    data: Partial<T>,
  ): Promise<T | null | undefined> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );

    return updated?.toJSON();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  // async deleteMany(ids: string[]): Promise<void> {
  //   await this.model.deleteMany({ _id: { $in: ids } });
  // }
}
