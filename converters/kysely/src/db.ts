import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect, type Generated } from 'kysely'


const database = new SQLite(':memory:');

database.prepare("CREATE TABLE person (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, is_active INTEGER, birth_date INTEGER)").run();

export const insert = database.prepare("INSERT INTO person (name, age, is_active, birth_date) VALUES ($name, $age, $is_active, $birth_date)");

insert.run({
  name: 'John',
  age: 30,
  is_active: 1,
  birth_date: (new Date('1990-01-01')).getTime()
});

insert.run({
  name: 'Jane',
  age: 25,
  is_active: 0,
  birth_date: (new Date('1990-01-02')).getTime()
});


export interface DB {
  person: {
    id: Generated<number>,
    name: string,
    age: number,
    is_active: boolean,
    birth_date: number
  }
}

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({ 
    database: async () => database
  })
});
