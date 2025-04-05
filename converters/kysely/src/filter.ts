import { ExpressionBuilder, ExpressionWrapper, SqlBool } from 'kysely'
import { ConfigurationError, converter, QueryValidationError, type CriteruimFilterQuery } from '@criterium/core';
import { KyselyQuery } from '.';



const compile = converter<(eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>>({
  operators: {
    $and: (_: any, __: any, children) => {
      return ({ eb, and }) => and(children.map(child => child(eb)))
    },
    $or: (_: any, __: any, children) => {
      return ({ eb, or }) => or(children.map(child => child(eb)))
    },
    $nor: (_: any, __: any, children) => {
      return ({ eb, not, or }) => not(or(children.map(child => child(eb))))
    },
    $not: (_: any, __: any, children) => {
      return ({ eb, not, and }) => not(and(children.map(child => child(eb))))
    },
    $all: (dataPath: Array<number | string>, values: any[]) => {
      return ({ eb }) => eb(dataPath.join('.'), '@>', eb.val(values))
    },
    $in: (dataPath: Array<number | string>, values: any[]) => {
      return ({ eb }) => eb(dataPath.join('.'), 'in', values)
    },
    $nin: (dataPath: Array<number | string>, values: any[]) => {
      return ({ eb }) => eb(dataPath.join('.'), 'not in', values)
    },
    $gt: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '>', value)
    },
    $gte: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '>=', value)
    },
    $lt: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '<', value)
    },
    $lte: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '<=', value)
    },
    $ne: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '!=', value)
    },
    $eq: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), '=', value)
    },
    $like: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }) => eb(dataPath.join('.'), 'like', value)
    },
    $exists: (dataPath: Array<number | string>, value: boolean) => {
      return ({ eb }) =>  eb(dataPath.join('.'), value ? 'is not' : 'is', null)
    }
  }
});

export type Match<DB, T extends Record<string, any>> = { [TB in keyof DB]:  DB[TB] extends T? TB : never; }[keyof DB];

if (compile instanceof ConfigurationError) {
  throw compile
}

export const filter = <Data extends Record<string, any>>(query: CriteruimFilterQuery<Data>) => {
  const predicate = compile(query) as (<DB, TB extends Match<DB, Data>>(eb: ExpressionBuilder<DB, TB>) => ExpressionWrapper<DB, TB, SqlBool>) | QueryValidationError
  if (predicate instanceof QueryValidationError) {
    return predicate;
  }
  return ((query: any) => query.where(predicate)) as <Q extends KyselyQuery<Data>>(query: Q) => Q;
}