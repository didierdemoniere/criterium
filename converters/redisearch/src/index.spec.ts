import { after, before, describe, test } from 'node:test'
import { SchemaFieldTypes } from 'redis';
import { connectingClient } from './redis';
import toRedisSearch from './';
import { expect } from 'expect';
import { QueryValidationError } from '@criterium/core';

type Person = {
  name: string;
  age: number;
  is_active: boolean;
  birth_date: number | Date;
}

const data: Person = {
  name: 'John',
  age: 30,
  is_active: true,
  birth_date: Number(new Date('1990-01-01')),
};

describe('redissearch', () => {
  let redisClient: Awaited<typeof connectingClient>;

  before(async () => {
    redisClient = await connectingClient;
    await redisClient.json.set('users:1', '$', data);

    await redisClient.ft.create(
      'idx:users',
      {
        '$.name': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: true,
          AS: 'name',
        },
        '$.age': {
          type: SchemaFieldTypes.NUMERIC,
          SORTABLE: true,
          AS: 'age',
        },
        '$.is_active': {
          type: SchemaFieldTypes.TAG,
          AS: 'is_active',
        },
        '$.birth_date': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'birth_date',
        },
      } as any,
      {
        ON: 'JSON',
        PREFIX: 'users',
      },
    );
  });

  after(async () => {
    await redisClient.disconnect();
  });

  describe('operators', () => {
    describe('empty query', () => {
      test('should return all documents', async () => {
        const test = toRedisSearch<Person>({ });
        if (test instanceof QueryValidationError) throw test;
        const result = await redisClient.ft.search('idx:users', ...test);

        expect(result.total).toEqual(1);
        expect(result.documents[0].value).toEqual(data);
      });
    });

    describe('$eq', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: 'John' });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(1);
        expect(resultName.documents[0].value).toEqual(data);

        const testAge = toRedisSearch<Person>({ age: 30 });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(1);
        expect(resultAge.documents[0].value).toEqual(data);

        const testIsActive = toRedisSearch<Person>({ is_active: true });
        if (testIsActive instanceof QueryValidationError) throw testIsActive;
        const resultIsActive = await redisClient.ft.search('idx:users', ...testIsActive);
        expect(resultIsActive.total).toEqual(1);
        expect(resultIsActive.documents[0].value).toEqual(data);

        const testBirthDate = toRedisSearch<Person>({ birth_date: new Date('1990-01-01') });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(1);
        expect(resultBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$ne', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: { $ne: 'John' } });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(0);

        const testAge = toRedisSearch<Person>({ age: { $ne: 30 } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(0);

        const testIsActive = toRedisSearch<Person>({ is_active: { $ne: true } });
        if (testIsActive instanceof QueryValidationError) throw testIsActive;
        const resultIsActive = await redisClient.ft.search('idx:users', ...testIsActive);
        expect(resultIsActive.total).toEqual(0);

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $ne: new Date('1990-01-01') } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(0);
      });
    });

    describe('$gt', () => {
      test('should support all supported types', async () => {
        expect(
          //@ts-ignore
          toRedisSearch<Person>({ name: { $gt: 'John' } })
        ).toEqual(new Error("unexpected value for operator $gt at '$.name.$gt'"));

        const testAge = toRedisSearch<Person>({ age: { $gt: 30 } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(0);

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $gt: true } })
        ).toEqual(new Error("unexpected value for operator $gt at '$.is_active.$gt'"));

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $gt: new Date('1990-01-01') } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(0);
      });
    });

    describe('$gte', () => {
      test('should support all supported types', async () => {
        expect(
          //@ts-ignore
          toRedisSearch<Person>({ name: { $gte: 'John' } })
        ).toEqual(new Error("unexpected value for operator $gte at '$.name.$gte'"));

        const testAge = toRedisSearch<Person>({ age: { $gte: 30 } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(1);
        expect(resultAge.documents[0].value).toEqual(data);

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $gte: true } })
        ).toEqual(new Error("unexpected value for operator $gte at '$.is_active.$gte'"));

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $gte: new Date('1990-01-01') } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(1);
        expect(resultBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$lt', () => {
      test('should support all supported types', async () => {
        expect(
          //@ts-ignore
          toRedisSearch<Person>({ name: { $lt: 'John' } })
        ).toEqual(new Error("unexpected value for operator $lt at '$.name.$lt'"));

        const testAge = toRedisSearch<Person>({ age: { $lt: 30 } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(0);

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $lt: true } })
        ).toEqual(new Error("unexpected value for operator $lt at '$.is_active.$lt'"));

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $lt: new Date('1990-01-01') } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(0);
      });
    });

    describe('$lte', () => {
      test('should support all supported types', async () => {
        expect(
          //@ts-ignore
          toRedisSearch<Person>({ name: { $lte: 'John' } })
        ).toEqual(new Error("unexpected value for operator $lte at '$.name.$lte'"));

        const testAge = toRedisSearch<Person>({ age: { $lte: 30 } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(1);
        expect(resultAge.documents[0].value).toEqual(data);

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $lte: true } })
        ).toEqual(new Error("unexpected value for operator $lte at '$.is_active.$lte'"));

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $lte: new Date('1990-01-01') } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(1);
        expect(resultBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$in', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: { $in: ['John'] } });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(1);
        expect(resultName.documents[0].value).toEqual(data);

        const testAge = toRedisSearch<Person>({ age: { $in: [30] } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(1);
        expect(resultAge.documents[0].value).toEqual(data);

        const testIsActive = toRedisSearch<Person>({ is_active: { $in: [true] } });
        if (testIsActive instanceof QueryValidationError) throw testIsActive;
        const resultIsActive = await redisClient.ft.search('idx:users', ...testIsActive);
        expect(resultIsActive.total).toEqual(1);
        expect(resultIsActive.documents[0].value).toEqual(data);

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $in: [new Date('1990-01-01')] } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(1);
        expect(resultBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$nin', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: { $nin: ['John'] } });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(0);

        const testAge = toRedisSearch<Person>({ age: { $nin: [30] } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(0);

        const testIsActive = toRedisSearch<Person>({ is_active: { $nin: [true] } });
        if (testIsActive instanceof QueryValidationError) throw testIsActive;
        const resultIsActive = await redisClient.ft.search('idx:users', ...testIsActive);
        expect(resultIsActive.total).toEqual(0);

        const testBirthDate = toRedisSearch<Person>({ birth_date: { $nin: [new Date('1990-01-01')] } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(0);
      });
    });

    describe('$exists', () => {
      test('should not be supported', async () => {
        expect(
          toRedisSearch<Person>({ name: { $exists: true } })
        ).toEqual(new Error("'$exists' operator not supported at '$.name.$exists'"));

        expect(
          toRedisSearch<Person>({ age: { $exists: true } })
        ).toEqual(new Error("'$exists' operator not supported at '$.age.$exists'"));

        expect(
          toRedisSearch<Person>({ is_active: { $exists: true } })
        ).toEqual(new Error("'$exists' operator not supported at '$.is_active.$exists'"));

        expect(
          toRedisSearch<Person>({ birth_date: { $exists: true } })
        ).toEqual(
          new Error("'$exists' operator not supported at '$.birth_date.$exists'"),
        );
      });
    });
    /*
    describe('$all', () => {
      const couple = {
        name: ['John', 'Jane'],
        age: [30, 25],
        is_active: [true, false],
        birth_date: [
          Number(new Date('1990-01-01')),
          Number(new Date('1990-01-02')),
        ],
      };

      beforeAll(async () => {
        await redisClient.json.set('couples:1', '$', couple);

        await redisClient.ft.create(
          'idx:couples',
          {
            '$.name': {
              type: SchemaFieldTypes.TEXT,
              // SORTABLE: true,
              AS: 'name',
            },
            '$.age': {
              type: SchemaFieldTypes.NUMERIC,
              SORTABLE: true,
              AS: 'age',
            },
            '$.is_active': {
              type: SchemaFieldTypes.TAG,
              AS: 'is_active',
            },
            '$.birth_date': {
              type: SchemaFieldTypes.NUMERIC,
              AS: 'birth_date',
            },
          } as any,
          {
            ON: 'JSON',
            PREFIX: 'couples',
          },
        );
      });

      test('should support all supported types', async () => {
        console.log(toRedisSearch<Person>({ name: { $all: ['John', 'Jane'] } }));
        const testName = await redisClient.ft.search(
          'idx:couples',
          ...toRedisSearch<Person>({ name: { $all: ['John', 'Jane'] } }),
        );
        expect(testName.total).toEqual(1);
        expect(testName.documents[0].value).toEqual(couple);

        const testAge = await redisClient.ft.search(
          'idx:couples',
          ...toRedisSearch<Person>({ age: { $all: [30, 25] } }),
        );
        expect(testAge.total).toEqual(1);
        expect(testAge.documents[0].value).toEqual(couple);

        const testIsActive = await redisClient.ft.search(
          'idx:couples',
          ...toRedisSearch<Person>({ is_active: { $all: [true, false] } }),
        );
        expect(testIsActive.total).toEqual(1);
        expect(testIsActive.documents[0].value).toEqual(couple);

        const testBirthDate = await redisClient.ft.search(
          'idx:couples',
          ...toRedisSearch<Person>({
            birth_date: {
              $all: [new Date('1990-01-01'), new Date('1990-01-02')],
            },
          }),
        );
        expect(testBirthDate.total).toEqual(1);
        expect(testBirthDate.documents[0].value).toEqual(couple);
      });
    });
    */
    describe('$like', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: { $like: 'Jo' } });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(1);
        expect(resultName.documents[0].value).toEqual(data);

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ age: { $like: 30 } })
        ).toEqual(new Error("unexpected value for operator $like at '$.age.$like'"));

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $like: true } })
        ).toEqual(
          new Error("unexpected value for operator $like at '$.is_active.$like'")
        );

        expect(
          //@ts-ignore
          toRedisSearch<Person>({ birth_date: { $like: new Date('1990-01-01') } })
        ).toEqual(
          new Error("unexpected value for operator $like at '$.birth_date.$like'")
        );
      });
    });

    describe('$not', () => {
      test('should support all supported types', async () => {
        const testName = toRedisSearch<Person>({ name: { $not: { $eq: 'John' } } });
        if (testName instanceof QueryValidationError) throw testName;
        const resultName = await redisClient.ft.search('idx:users', ...testName);
        expect(resultName.total).toEqual(0);

        const testAge = toRedisSearch<Person>({ age: { $not: { $eq: 30 } } });
        if (testAge instanceof QueryValidationError) throw testAge;
        const resultAge = await redisClient.ft.search('idx:users', ...testAge);
        expect(resultAge.total).toEqual(0);

        const testIsActive = toRedisSearch<Person>({ is_active: { $not: { $eq: true } } });
        if (testIsActive instanceof QueryValidationError) throw testIsActive;
        const resultIsActive = await redisClient.ft.search('idx:users', ...testIsActive);
        expect(resultIsActive.total).toEqual(0);

        const testBirthDate = toRedisSearch<Person>({  birth_date: { $not: { $eq: new Date('1990-01-01') } } });
        if (testBirthDate instanceof QueryValidationError) throw testBirthDate;
        const resultBirthDate = await redisClient.ft.search('idx:users', ...testBirthDate);
        expect(resultBirthDate.total).toEqual(0);
      });
    });

    describe('$and', () => {
      test('should support all supported types', async () => {
        const testNameAndAge = toRedisSearch<Person>({
            $and: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          });
        if (testNameAndAge instanceof QueryValidationError) throw testNameAndAge;
        const resultNameAndAge = await redisClient.ft.search('idx:users', ...testNameAndAge);
        expect(resultNameAndAge.total).toEqual(1);
        expect(resultNameAndAge.documents[0].value).toEqual(data);

        const testIsActiveAndBirthDate = toRedisSearch<Person>({
            $and: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          });
        if (testIsActiveAndBirthDate instanceof QueryValidationError) throw testIsActiveAndBirthDate;
        const resultIsActiveAndBirthDate = await redisClient.ft.search('idx:users', ...testIsActiveAndBirthDate);
        expect(resultIsActiveAndBirthDate.total).toEqual(1);
        expect(resultIsActiveAndBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$or', () => {
      test('should support all supported types', async () => {
        const testNameOrAge = toRedisSearch<Person>({
            $or: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          });
        if (testNameOrAge instanceof QueryValidationError) throw testNameOrAge;
        const resultNameOrAge = await redisClient.ft.search('idx:users', ...testNameOrAge);
        expect(resultNameOrAge.total).toEqual(1);
        expect(resultNameOrAge.documents[0].value).toEqual(data);

        const testIsActiveOrBirthDate = toRedisSearch<Person>({
            $or: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          });
        if (testIsActiveOrBirthDate instanceof QueryValidationError) throw testIsActiveOrBirthDate;
        const resultIsActiveOrBirthDate = await redisClient.ft.search('idx:users', ...testIsActiveOrBirthDate);
        expect(resultIsActiveOrBirthDate.total).toEqual(1);
        expect(resultIsActiveOrBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$nor', () => {
      test('should support all supported types', async () => {
        const testNameNorAge = toRedisSearch<Person>({
            $nor: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          });
        if (testNameNorAge instanceof QueryValidationError) throw testNameNorAge;
        const resultNameNorAge = await redisClient.ft.search('idx:users', ...testNameNorAge);
        expect(resultNameNorAge.total).toEqual(0);

        const testIsActiveNorBirthDate = toRedisSearch<Person>({
            $nor: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          });
        if (testIsActiveNorBirthDate instanceof QueryValidationError) throw testIsActiveNorBirthDate;
        const resultIsActiveNorBirthDate = await redisClient.ft.search('idx:users', ...testIsActiveNorBirthDate);
        expect(resultIsActiveNorBirthDate.total).toEqual(0);
      });
    });
  });
});
