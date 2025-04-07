import { KyselySelectQuery } from ".";

export function offset<Data extends Record<string, any>>(value: number) {
  return ((query) => query.offset(value)) as <Q extends KyselySelectQuery<Data>>(query: Q) => Q
}
  