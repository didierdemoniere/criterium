import { ExpressionBuilder, ExpressionWrapper, SqlBool } from 'kysely'
import { converter } from '@criterium/core';

export default converter({
  operators: {
    $and: (_: any, __: any, children: Array<(eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>>) => {
      return ({ eb, and }: ExpressionBuilder<any, any>) => and(children.map(child => child(eb)))
    },
    $or: (_: any, __: any, children: Array<(eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>>) => {
      return ({ eb, or }: ExpressionBuilder<any, any>) => or(children.map(child => child(eb)))
    },
    $nor: (_: any, __: any, children: Array<(eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>>) => {
      return ({ eb, not, or }: ExpressionBuilder<any, any>) => not(or(children.map(child => child(eb))))
    },
    $not: (_: any, __: any, children: Array<(eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>>) => {
      return ({ eb, not, and }: ExpressionBuilder<any, any>) => not(and(children.map(child => child(eb))))
    },
    // $all: (dataPath: Array<number | string>, values: any[]) => {
    //   return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '@>', values)
    // },
    $in: (dataPath: Array<number | string>, values: any[]) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), 'in', values)
    },
    $nin: (dataPath: Array<number | string>, values: any[]) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), 'not in', values)
    },
    $gt: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '>', value)
    },
    $gte: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '>=', value)
    },
    $lt: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '<', value)
    },
    $lte: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '<=', value)
    },
    $ne: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '!=', value)
    },
    $eq: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), '=', value)
    },
    $like: (dataPath: Array<number | string>, value: any) => {
      return ({ eb }: ExpressionBuilder<any, any>) => eb(dataPath.join('.'), 'like', value)
    },
    $exists: (dataPath: Array<number | string>, value: boolean) => {
      return ({ eb }: ExpressionBuilder<any, any>) =>  eb(dataPath.join('.'), value ? 'is not' : 'is', null)
    }
  }
});
