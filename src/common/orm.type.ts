import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';
import { OptionalPagination, PaginationDto } from './dto';

export type OrmWhereType<T> = FindOptionsWhere<T>[] | FindOptionsWhere<T>;
export type OrmSelectType<T> = FindOptionsSelect<T> | Array<keyof T>;
export type OrmRelationType<T> = FindOptionsRelations<T> | Array<keyof T>;
export type OrmOrderType<T> = FindOptionsOrder<T> | undefined;

/**
 * A generic type definition for a function that retrieves a single record from a database
 * using filtering, selection, and relation inclusion.
 *
 * @template T - The Entity.
 *
 * @param where - Conditions to filter the entity. Determines which record to find.
 *                Should conform to the shape defined by `OrmWhereType<T>`.
 *
 * @param select - (Optional) Fields to include in the result.
 *                 Should match the shape defined by `OrmSelectType<T>`.
 *
 * @param relations - (Optional) Related entities to include (e.g., joins).
 *                    Should match the shape defined by `OrmRelationType<T>`.
 *
 * @returns A promise that resolves to the found entity of type `T`, or `null` if no match is found.
 */
export type FindOneFn<T> = (
  where: OrmWhereType<T>,
  select?: OrmSelectType<T>,
  relations?: OrmRelationType<T>,
) => Promise<T | null>;

export type FailOnFoundFn<T> = (
  where: OrmWhereType<T>,
  relations?: OrmRelationType<T>,
) => Promise<void>;

export type FindOrFailFn<T> = (...args: Parameters<FindOneFn<T>>) => Promise<T>;

export type FindManyFn<T> = (
  where: OrmWhereType<T>,
  select?: OrmSelectType<T>,
  order?: OrmOrderType<T>,
  relations?: OrmRelationType<T>,
) => Promise<T[]>;

export type FindAndCountFn<T> = (
  where: OrmWhereType<T>,
  select?: OrmSelectType<T>,
  pagination?: OptionalPagination | PaginationDto,
  order?: OrmOrderType<T>,
  relations?: OrmRelationType<T>,
) => Promise<[T[], number]>;

export type extracTruthyFieldsFn<T> = (
  enitity: T,
  payload: DeepPartial<T>,
  nonDupicateFeild: Array<keyof T>,
) => Partial<T>;
