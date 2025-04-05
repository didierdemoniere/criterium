import { ColumnType, Generated, Kysely, PostgresDialect, sql } from 'kysely';
import { connectingClient } from './postgres';
import seed from './seed';
import { KyselyQuery } from '.';
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface User {
  id: Generated<number>,
  name: string,
  age: number,
  is_active: boolean,
  birth_date: Timestamp | Date,
  interests: Array<string>
}

export interface DB {
  user: User
}

export default async function initDB() {
  const pool = await connectingClient;
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool
    }),
    log: ['error', 'query'],
  }).withSchema('public');

  await db.schema.createTable('user')
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('name', 'varchar')
    .addColumn('age', 'integer')
    .addColumn('is_active', 'boolean')
    .addColumn('birth_date', 'timestamptz')
    .addColumn('interests', sql`text[]`)
    .execute();

  await db.insertInto('user').values(seed).execute();

  return {
    getBaseQuery: () => db.selectFrom('user').selectAll(),
    getResults: async <Q extends KyselyQuery<User>>(query: Q) => {
      const results = await (query as any).execute();
      return results.map(({ id, ...data}) => data);
    },
    destroy: async () => await pool.end()
  }
}

