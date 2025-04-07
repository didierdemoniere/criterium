import { CriteruimFilterQuery, CriteruimQuery, QueryValidationError } from '@criterium/core'
import { filter } from './filter'
import { sort } from './sort'
import { CompiledQuery, ExpressionBuilder, ExpressionWrapper, OrderByExpression, SqlBool } from 'kysely';
import { offset } from './offset'
import { limit } from './limit'

export type KyselyUpdateQuery<Data> = {
  compile(): CompiledQuery<Data>;
  where(conditions: (eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>): KyselyUpdateQuery<Data>;
  limit(value: number): KyselyUpdateQuery<Data>;
}

export type KyselyDeleteQuery<Data> = {
  compile(): CompiledQuery<Data>;
  where(...args: any[]): KyselyDeleteQuery<Data>;
  orderBy(expression: OrderByExpression<any, any, any>): KyselyDeleteQuery<Data>;
  limit(value: number): KyselyDeleteQuery<Data>;
}

export type KyselySelectQuery<Data> = {
  compile(): CompiledQuery<Data>;
  where(conditions: (eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>): KyselySelectQuery<Data>;
  orderBy(prop: string, direction: 'asc' | 'desc'): KyselySelectQuery<Data>;
  offset(value: number): KyselySelectQuery<Data>;
  limit(value: number): KyselySelectQuery<Data>;
}

export type KyselyQuery<Data> = KyselySelectQuery<Data> | KyselyUpdateQuery<Data> | KyselyDeleteQuery<Data>;

type KyselyQueryOutput<T extends KyselyUpdateQuery<any>> = ReturnType<T['compile']> extends CompiledQuery<infer X> 
  ? X extends Record<string, any> ? X : never : never;

export { type CriteruimQuery, QueryValidationError };


function customize <Q extends KyselyUpdateQuery<any>> (baseQuery: Q, query: Omit<CriteruimQuery<KyselyQueryOutput<Q>>, '$skip' | '$sort'>): Q | QueryValidationError;
function customize <Q extends KyselyDeleteQuery<any>> (baseQuery: Q, query: Omit<CriteruimQuery<KyselyQueryOutput<Q>>, '$skip'>): Q | QueryValidationError;
function customize <Q extends KyselySelectQuery<any>> (baseQuery: Q, query: CriteruimQuery<KyselyQueryOutput<Q>>): Q | QueryValidationError;
function customize <Q extends KyselyQuery<any>>(baseQuery: Q, query: CriteruimQuery<KyselyQueryOutput<Q>> |  Omit<CriteruimQuery<KyselyQueryOutput<Q>>, '$skip'> | Omit<CriteruimQuery<KyselyQueryOutput<Q>>, '$skip' | '$sort'>) {
  const { $sort, $limit, $skip, ...conditions } = query;
  let kQuery = baseQuery;

  if (Object.keys(conditions).length > 0) {
    const queryFilter = filter(conditions as CriteruimFilterQuery<ReturnType<Q['compile']>>);
    if (queryFilter instanceof QueryValidationError) {
      return queryFilter
    }
    kQuery = queryFilter(kQuery);
  }

  if ($sort && Object.keys($sort).length > 0) {
    if (!('orderBy' in kQuery)) {
      return new QueryValidationError('OperatorNotSupported', $sort, ['$sort'], []);
    }
    kQuery = sort($sort)(kQuery) as Q;
  }

  if (typeof $skip === 'number') {
    if (!('offset' in kQuery)) {
      return new QueryValidationError('OperatorNotSupported', $skip, ['$skip'], []);
    }
    kQuery = offset($skip)(kQuery) as Q;
  }

  if (typeof $limit === 'number') {
    kQuery = limit($limit)(kQuery);
  }

  return kQuery;
};

export default customize;