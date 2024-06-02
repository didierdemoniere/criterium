import { after, before, describe, test } from 'node:test'
// import { db } from './db'
import toKysely from './index';
import { expect } from 'expect';
import { connectingClient } from './postgres';
import { Generated, ColumnType, Kysely, PostgresDialect, SelectQueryBuilder, sql } from 'kysely';
export type Timestamp = ColumnType<Date, Date | string, Date | string>;


export interface DB {
  person: {
    id: Generated<number>,
    name: string,
    age: number,
    is_active: boolean,
    birth_date: Timestamp,
    intrests: string[]
  }
}

describe('kysely - postgres', () => {
  let pool: Awaited<typeof connectingClient>;
  let db: Kysely<DB>;
  let persons: SelectQueryBuilder<DB, "person", DB['person']>;

  before(async () => {
    pool = await connectingClient;

    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool
      }),
      log: ['error', 'query'],
    }).withSchema('public');

    await db.schema.createTable('person')
      .addColumn('id', 'serial', (cb) => cb.primaryKey())
      .addColumn('name', 'varchar')
      .addColumn('age', 'integer')
      .addColumn('is_active', 'boolean')
      .addColumn('birth_date', 'timestamptz')
      .addColumn('intrests', sql`text[]`)
      .execute()

    await db.insertInto('person').values({
        name: 'John',
        age: 30,
        is_active: true,
        birth_date: new Date('1990-01-01'),
        intrests: ['programming', 'sports']
      })
      .execute();

    await db.insertInto('person').values({
        name: 'Jane',
        age: 25,
        is_active: false,
        birth_date: new Date('1990-01-02'),
        intrests: ['music', 'sports']
      })
      .execute();

    persons = db.selectFrom('person').selectAll() as any;
  });

  after(async () => {
    await pool.end();
  });

  describe('operators', () => {
    describe('empty query', () => {
      test('should match everything', async () => {
        const results = await persons.where(toKysely({})).execute();
        expect(results.length).toEqual(2);
      });
    });
    describe('$eq', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: 'John' })).execute();
        expect(resultName.length).toEqual(1);
        expect(resultName[0].name).toEqual('John');

        const resultAge = await persons.where(toKysely({ age: 30 })).execute();
        expect(resultAge.length).toEqual(1);
        expect(resultAge[0].age).toEqual(30);

        const resultIsActive = await persons.where(toKysely({ is_active: true })).execute();
        expect(resultIsActive.length).toEqual(1);
        expect(resultIsActive[0].is_active).toEqual(true);

        const resultBirthDate = await persons.where(toKysely({ birth_date: new Date('1990-01-01') })).execute();
        expect(resultBirthDate.length).toEqual(1);
        expect(resultBirthDate[0].birth_date).toEqual(new Date('1990-01-01'));
      });
    });

    describe('$ne', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $ne: 'John' } })).execute();
        expect(resultName.length).toEqual(1);
        expect(resultName[0].name).not.toEqual('John');

        const resultAge = await persons.where(toKysely({ age: { $ne: 30 } })).execute();
        expect(resultAge.length).toEqual(1);
        expect(resultAge[0].age).not.toEqual(30);

        const resultIsActive = await persons.where(toKysely({ is_active: { $ne: true } })).execute();
        expect(resultIsActive.length).toEqual(1);
        expect(resultIsActive[0].is_active).not.toEqual(1);

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $ne: new Date('1990-01-01') } })).execute();
        expect(resultBirthDate.length).toEqual(1);
        expect(resultBirthDate[0].birth_date).not.toEqual(new Date('1990-01-01'));
      });
    });

    describe('$gt', () => {
      test('should support all supported types', async () => {
        expect(async () => {
          await persons.where(toKysely({ name: { $gt: 'John' } })).execute()
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $gt at '$.name.$gt'")

        const resultAge = await persons.where(toKysely({ age: { $gt: 30 } })).execute();
        expect(resultAge.length).toEqual(0);

        expect(async () => {
          await persons.where(toKysely({ is_active: { $gt: true } })).execute()
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $gt at '$.is_active.$gt'")

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $gt: new Date('1990-01-01') } })).execute();
        expect(resultBirthDate.length).toEqual(1);
      });
    });

    describe('$gte', () => {
      test('should support all supported types', async () => {
        expect(async () => {
          await persons.where(toKysely({ name: { $gte: 'John' } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $gte at '$.name.$gte'");

        const resultAge = await persons.where(toKysely({ age: { $gte: 30 } })).execute();
        expect(resultAge.length).toEqual(1);

        expect(async () => {
          await persons.where(toKysely({ is_active: { $gte: true } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $gte at '$.is_active.$gte'");

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $gte: new Date('1990-01-01') } })).execute();
        expect(resultBirthDate.length).toEqual(2);
      });
    });

    describe('$lt', () => {
      test('should support all supported types', async () => {
        expect(async () => {
          await persons.where(toKysely({ name: { $lt: 'John' } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $lt at '$.name.$lt'");

        const resultAge = await persons.where(toKysely({ age: { $lt: 30 } })).execute();
        expect(resultAge.length).toEqual(1);

        expect(async () => {
          await persons.where(toKysely({ is_active: { $lt: true } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $lt at '$.is_active.$lt'");

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $lt: new Date('1990-01-01') } })).execute();
        expect(resultBirthDate.length).toEqual(0);
      });
    });

    describe('$lte', () => {
      test('should support all supported types', async () => {
        expect(async () => {
          await persons.where(toKysely({ name: { $lte: 'John' } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $lte at '$.name.$lte'");

        const resultAge = await persons.where(toKysely({ age: { $lte: 30 } })).execute();
        expect(resultAge.length).toEqual(2);

        expect(async () => {
          await persons.where(toKysely({ is_active: { $lte: true } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $lte at '$.is_active.$lte'");

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $lte: new Date('1990-01-01') } })).execute();
        expect(resultBirthDate.length).toEqual(1);
      });
    });

    describe('$in', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $in: ['John'] } })).execute();
        expect(resultName.length).toEqual(1);

        const resultAge = await persons.where(toKysely({ age: { $in: [30] } })).execute();
        expect(resultAge.length).toEqual(1);

        const resultIsActive = await persons.where(toKysely({ is_active: { $in: [1] } })).execute();
        expect(resultIsActive.length).toEqual(1);

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $in: [new Date('1990-01-01')] } })).execute();
        expect(resultBirthDate.length).toEqual(1);
      });
    });

    describe('$nin', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $nin: ['John'] } })).execute();
        expect(resultName.length).toEqual(1);

        const resultAge = await persons.where(toKysely({ age: { $nin: [30] } })).execute();
        expect(resultAge.length).toEqual(1);

        const resultIsActive = await persons.where(toKysely({ is_active: { $nin: [1] } })).execute();
        expect(resultIsActive.length).toEqual(1);

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $nin: [new Date('1990-01-01')] } })).execute();
        expect(resultBirthDate.length).toEqual(1);
      });
    });

    describe('$exists', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $exists: true } })).execute();
        expect(resultName.length).toEqual(2);

        const resultAge = await persons.where(toKysely({ age: { $exists: false } })).execute();
        expect(resultAge.length).toEqual(0);

        const resultIsActive = await persons.where(toKysely({ is_active: { $exists: true } })).execute();
        expect(resultIsActive.length).toEqual(2);

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $exists: false } })).execute();
        expect(resultBirthDate.length).toEqual(0);
      });
    });

    // describe('$all', () => {
    //   test('should support all supported types', async () => {
    //     const sqlArr = (values: any[]) => sql`ARRAY[${sql.join(values)}]`;
        
    //     const result1 = await persons.where(toKysely({ intrests: { $all: (['sports', 'programming']) } })).execute();
    //     expect(result1.length).toEqual(1);

    //     const result2 = await persons.where(toKysely({ intrests: { $all: (['sports', 'music']) } })).execute();
    //     expect(result2.length).toEqual(1);

    //     const result3 = await persons.where(toKysely({ intrests: { $all: (['sports']) } })).execute();
    //     expect(result3.length).toEqual(2);
    //   });
    // });

    describe('$like', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $like: 'Jo%' } })).execute();
        expect(resultName.length).toEqual(1);

        expect(async () => {
          await persons.where(toKysely({ age: { $like: 30 } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $like at '$.age.$like'");

        expect(async () => {
          await persons.where(toKysely({ is_active: { $like: true } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $like at '$.is_active.$like'");

        expect(async () => {
          await persons.where(toKysely({ birth_date: { $like: new Date('1990-01-01') } })).execute();
        }).rejects.toHaveProperty('message', "UnexpectedValueError: unexpected value for operator $like at '$.birth_date.$like'");
      });
    });

    describe('$not', () => {
      test('should support all supported types', async () => {
        const resultName = await persons.where(toKysely({ name: { $not: { $eq: 'John' } } })).execute();
        expect(resultName.length).toEqual(1);

        const resultAge = await persons.where(toKysely({ age: { $not: { $eq: 30 } } })).execute();
        expect(resultAge.length).toEqual(1);

        const resultIsActive = await persons.where(toKysely({ is_active: { $not: { $eq: true } } })).execute();
        expect(resultIsActive.length).toEqual(1);

        const resultBirthDate = await persons.where(toKysely({ birth_date: { $not: { $eq: new Date('1990-01-01') } } })).execute();
        expect(resultBirthDate.length).toEqual(1);
      });
    });

    describe('$and', () => {
      test('should support all supported types', async () => {
        const resultNameAndAge = await persons.where(toKysely({
          $and: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
        })).execute();
        expect(resultNameAndAge.length).toEqual(1);

        const resultIsActiveAndBirthDate = await persons.where(toKysely({
          $and: [
            { is_active: { $eq: true } },
            { birth_date: { $eq: new Date('1990-01-01') } },
          ],
        })).execute();
        expect(resultIsActiveAndBirthDate.length).toEqual(1);
      });
    });

    describe('$or', () => {
      test('should support all supported types', async () => {
        const resultNameAndAge = await persons.where(toKysely({
          $or: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
        })).execute();
        expect(resultNameAndAge.length).toEqual(1);

        const resultIsActiveAndBirthDate = await persons.where(toKysely({
          $or: [
            { is_active: { $eq: true } },
            { birth_date: { $eq: new Date('1990-01-01') } },
          ],
        })).execute();
        expect(resultIsActiveAndBirthDate.length).toEqual(1);
      });
    });

    describe('$nor', () => {
      test('should support all supported types', async () => {
        const resultNameAndAge = await persons.where(toKysely({
          $nor: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
        })).execute();
        expect(resultNameAndAge.length).toEqual(1);

        const resultIsActiveAndBirthDate = await persons.where(toKysely({
          $nor: [
            { is_active: { $eq: true } },
            { birth_date: { $eq: new Date('1990-01-01') } },
          ],
        })).execute();
        expect(resultIsActiveAndBirthDate.length).toEqual(1);
      });
    });
  });
});

