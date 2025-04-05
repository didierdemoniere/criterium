import { CriteruimSortQuery } from "@criterium/core"
import { DeleteQueryBuilder, ExpressionBuilder, ExpressionWrapper, SelectQueryBuilder, UpdateQueryBuilder } from "kysely"
import { KyselyQuery } from ".";

export const sort = <Data extends Record<string, any>>(sorts: CriteruimSortQuery<Data>) => {
  return ((query) => {
    return Object.entries(sorts).reduce((q: any, [prop, direction]) => q.orderBy(prop, direction === -1 ? 'desc' : 'asc'), query);
  }) as <Q extends KyselyQuery<Data>>(query: Q) => Q;
}

