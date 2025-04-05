import { DeleteQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";
import { KyselyQuery } from ".";

export function offset<Data extends Record<string, any>>(value: number) {
  return ((query) => query.offset(value)) as <Q extends KyselyQuery<Data>>(query: Q) => Q
}
  