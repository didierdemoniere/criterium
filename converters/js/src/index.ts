import { CriteruimFilterQuery, CriteruimQuery, QueryValidationError } from '@criterium/core'
import { filter } from './filter'
import { sort } from './sort'
import { offset } from './offset'
import { limit } from './limit'

export { type CriteruimQuery, QueryValidationError };

export default <Data extends Record<string, any>>(arr: Array<Data>, query: CriteruimQuery<Data>) => {
  const { $sort, $limit, $skip, ...conditions } = query;
  let jsQuery = arr;

  if (Object.keys(conditions).length > 0) {
    const queryFilter = filter(conditions as CriteruimFilterQuery<Data>);
    if (queryFilter instanceof QueryValidationError) {
      return queryFilter
    }
    jsQuery = queryFilter(jsQuery);
  }

  if ($sort && Object.keys($sort).length > 0) {
    jsQuery = sort($sort)(jsQuery);
  }

  if (typeof $skip === 'number') {
    jsQuery = offset($skip)(jsQuery);
  }

  if (typeof $limit === 'number') {
    jsQuery = limit($limit)(jsQuery);
  }

  return jsQuery;
};

export const converterOptions = {
  predicate: {
    get: (obj: any, path: Array<string | number>) => {
      return path.reduce((current, key) => current && current[key], obj);
    },
  },
};
