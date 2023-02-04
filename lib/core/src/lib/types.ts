import { operators } from './validation';

/**
 *
 */
export type CriteriumOperator<
  T,
  XCTX extends { schema?: any } = { schema?: any },
> = (
  path: Array<string | number>,
  value: any,
  children: Array<T>,
  options: { ctx: CriteriumContext<XCTX>; path: Array<string | number> },
) => T;

/**
 *
 */
export interface CriteriumDialect<
  T,
  R = T,
  XCTX extends { schema?: any } = { schema?: any },
> {
  operators: Record<'$eq' | '$and', CriteriumOperator<T, XCTX>> &
    Partial<Record<keyof typeof operators, CriteriumOperator<T, XCTX>>>;

  extendCtx?: () => XCTX;

  dataDepth?: number;

  resolve?: (result: T, ctx: CriteriumContext<XCTX>) => R;
  reject?: (errors: Array<Error>, ctx: CriteriumContext<XCTX>) => Error;
}

/**
 *
 */
export type CriteriumContext<T extends { schema?: any } = { schema?: any }> = {
  errors: Array<Error>;
} & T;

/**
 *
 */
export type CriteruimExpression<T> = {
  $not?: CriteruimExpression<T>;
  $exists?: boolean;
} & (T extends object
  ? {
      [K in keyof T]?: CriteruimExpression<T[K]>;
    }
  : T extends Array<any>
  ? {
      $all?: T;
    }
  : T extends number
  ?
      | T
      | {
          $gt?: T;
          $gte?: T;
          $lt?: T;
          $lte?: T;
          $in?: T[];
          $nin?: T[];
          $eq?: T;
          $ne?: T;
        }
  : T extends string
  ?
      | T
      | {
          $in?: T[];
          $nin?: T[];
          $eq?: T;
          $ne?: T;
          $like?: T;
        }
  : never);

/**
 *
 */
export type CriteruimQuery<T extends Record<string, any>> = {
  $and?: Array<CriteruimQuery<T>>;
  $or?: Array<CriteruimQuery<T>>;
  $nor?: Array<CriteruimQuery<T>>;
} & {
  [K in keyof T]?: CriteruimExpression<T[K]>;
};
