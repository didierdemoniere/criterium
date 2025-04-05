import { DeleteQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";
import { KyselyQuery } from ".";

export function limit<Data extends Record<string, any>>(value: number){
  return ((query) => query.limit(value)) as <Q extends KyselyQuery<Data>>(query: Q) => Q
}
  