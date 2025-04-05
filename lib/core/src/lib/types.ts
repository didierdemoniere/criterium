import { operators } from './validation';

/**
 *
 */
type CriteriumOperator<T> = (
  path: Array<string | number>,
  value: any,
  children: Array<T>,
  options: { path: Array<string | number> },
) => T;

/**
 *
 */
export interface CriteriumDialect<T> {
  dataDepth?: number;
  operators: Record<'$eq' | '$and', CriteriumOperator<T>> &
    Partial<Record<keyof typeof operators, CriteriumOperator<T>>>;
}

/**
 *
 */
export type CriteruimExpression<T> = (
  T extends number | Date
  ?  T | {
    $not?: CriteruimExpression<T>;
    $exists?: boolean;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: T[];
    $nin?: T[];
    $eq?: T;
    $ne?: T;
  }
  : T extends Array<any>
  ? {
      $not?: CriteruimExpression<T>;
      $exists?: boolean;
      $all?: T;
    }
  : T extends string
  ? T | {
      $not?: CriteruimExpression<T>;
      $exists?: boolean;
      $in?: T[];
      $nin?: T[];
      $eq?: T;
      $ne?: T;
      $like?: T;
    }
  : T extends object
  ? ({
      $not?: CriteruimExpression<T>;
      $exists?: boolean;
    } & {
      [K in keyof T]?: CriteruimExpression<T[K]>;
    })
  : T | {
    $not?: CriteruimExpression<T>;
    $exists?: boolean;
    $in?: T[];
    $nin?: T[];
    $eq?: T;
    $ne?: T;
  });

/**
 *
 */
export type CriteruimFilterQuery<T extends Record<string, any>> = {
  $and?: Array<CriteruimFilterQuery<T>>;
  $or?: Array<CriteruimFilterQuery<T>>;
  $nor?: Array<CriteruimFilterQuery<T>>;
} & {
  [K in keyof T]?: CriteruimExpression<T[K]>;
};

export type CriteruimSortQuery<T extends Record<string, any>> = {
  [K in keyof T]?: 1 | -1
}

export type CriteruimQuery<T extends Record<string, any>> = CriteruimFilterQuery<T> & {
  $sort?: CriteruimSortQuery<T>;
  $skip?: number;
  $limit?: number;
};
