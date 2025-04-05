import { CriteruimFilterQuery, CriteruimQuery, QueryValidationError } from '@criterium/core'
import { filter } from './filter'
import { sort } from './sort'
import { CompiledQuery, ExpressionBuilder, ExpressionWrapper, SqlBool } from 'kysely';
import { offset } from './offset'
import { limit } from './limit'

export type KyselyQuery<Data> = {
  compile(): CompiledQuery<Data>;
  where(conditions: (eb: ExpressionBuilder<any, any>) => ExpressionWrapper<any, any, SqlBool>): KyselyQuery<Data>;
  orderBy(prop: string, direction: 'asc' | 'desc'): KyselyQuery<Data>;
  offset(value: number): KyselyQuery<Data>;
  limit(value: number): KyselyQuery<Data>;
}

type KyselyQueryOutput<T extends KyselyQuery<any>> = ReturnType<T['compile']> extends CompiledQuery<infer X> 
  ? X extends Record<string, any> ? X : never : never;

export { type CriteruimQuery, QueryValidationError };

export default <Q extends KyselyQuery<any>> (baseQuery: Q, query: CriteruimQuery<KyselyQueryOutput<Q>>) => {
  const { $sort, $limit, $skip, ...conditions } = query;
  let kQuery: Q = baseQuery;

  if (Object.keys(conditions).length > 0) {
    const queryFilter = filter(conditions as CriteruimFilterQuery<ReturnType<Q['compile']>>);
    if (queryFilter instanceof QueryValidationError) {
      return queryFilter
    }
    kQuery = queryFilter(kQuery);
  }

  if ($sort && Object.keys($sort).length > 0) {
    kQuery = sort($sort)(kQuery);
  }

  if (typeof $skip === 'number') {
    kQuery = offset($skip)(kQuery);
  }

  if (typeof $limit === 'number') {
    kQuery = limit($limit)(kQuery);
  }

  return kQuery;
};

