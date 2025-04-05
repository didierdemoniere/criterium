import { CriteruimFilterQuery, QueryValidationError, utils, type CriteruimQuery } from '@criterium/core';
import filter from './filter';
import { sort } from './sort';
import { paginate } from './paginate';
import { SearchOptions } from 'redis';

export type RSQuery = [string] | [string, string | undefined] | [string, string | undefined, SearchOptions | undefined];

export { type CriteruimQuery, QueryValidationError };

export default <Data extends Record<string, any>> (baseQuery: RSQuery, query: CriteruimQuery<Data>) => {
  const { $sort, $limit, $skip, ...conditions } = query;
  let rsQuery: [string, string, SearchOptions] = [baseQuery[0], baseQuery[1] || '', {
    DIALECT: 2,
    ...baseQuery[2]
  }];

  if (Object.keys(conditions).length > 0) {
    const queryFilter = filter(conditions as CriteruimFilterQuery<Data>);
    if (queryFilter instanceof QueryValidationError) {
      return queryFilter
    }
    rsQuery = queryFilter(...rsQuery);
  } else {
    if (!rsQuery[1]) {
      rsQuery[1] = '*'
    }
  }

  if ($sort && Object.keys($sort).length > 0) {
    rsQuery = sort($sort)(...rsQuery);
  }

  if (typeof $skip === 'number' || typeof $limit === 'number') {
    rsQuery = paginate($skip, $limit)(...rsQuery);
  }

  return rsQuery;
}