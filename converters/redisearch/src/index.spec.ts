import { after, before, describe, test } from 'node:test'
import { SchemaFieldTypes } from 'redis';
import { connectingClient } from './redis';
import toRedisSearch from './';
import { expect } from 'expect';

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
        const result = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({}),
        );
        expect(result.total).toEqual(1);
        expect(result.documents[0].value).toEqual(data);
      });
    });

    describe('$eq', () => {
      test('should support all supported types', async () => {
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: 'John' }),
        );
        expect(testName.total).toEqual(1);
        expect(testName.documents[0].value).toEqual(data);

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: 30 }),
        );
        expect(testAge.total).toEqual(1);
        expect(testAge.documents[0].value).toEqual(data);

        const testIsActive = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ is_active: true }),
        );
        expect(testIsActive.total).toEqual(1);
        expect(testIsActive.documents[0].value).toEqual(data);

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: new Date('1990-01-01') }),
        );
        expect(testBirthDate.total).toEqual(1);
        expect(testBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$ne', () => {
      test('should support all supported types', async () => {
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: { $ne: 'John' } }),
        );
        expect(testName.total).toEqual(0);

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $ne: 30 } }),
        );
        expect(testAge.total).toEqual(0);

        const testIsActive = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ is_active: { $ne: true } }),
        );
        expect(testIsActive.total).toEqual(0);

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $ne: new Date('1990-01-01') } }),
        );
        expect(testBirthDate.total).toEqual(0);
      });
    });

    describe('$gt', () => {
      test('should support all supported types', async () => {
        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ name: { $gt: 'John' } });
        }).toThrow("unexpected value for operator $gt at '$.name.$gt'");

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $gt: 30 } }),
        );
        expect(testAge.total).toEqual(0);

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $gt: true } });
        }).toThrow("unexpected value for operator $gt at '$.is_active.$gt'");

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $gt: new Date('1990-01-01') } }),
        );
        expect(testBirthDate.total).toEqual(0);
      });
    });

    describe('$gte', () => {
      test('should support all supported types', async () => {
        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ name: { $gte: 'John' } });
        }).toThrow("unexpected value for operator $gte at '$.name.$gte'");

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $gte: 30 } }),
        );
        expect(testAge.total).toEqual(1);
        expect(testAge.documents[0].value).toEqual(data);

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $gte: true } });
        }).toThrow("unexpected value for operator $gte at '$.is_active.$gte'");

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $gte: new Date('1990-01-01') } }),
        );
        expect(testBirthDate.total).toEqual(1);
        expect(testBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$lt', () => {
      test('should support all supported types', async () => {
        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ name: { $lt: 'John' } });
        }).toThrow("unexpected value for operator $lt at '$.name.$lt'");

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $lt: 30 } }),
        );
        expect(testAge.total).toEqual(0);

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $lt: true } });
        }).toThrow("unexpected value for operator $lt at '$.is_active.$lt'");

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $lt: new Date('1990-01-01') } }),
        );
        expect(testBirthDate.total).toEqual(0);
      });
    });

    describe('$lte', () => {
      test('should support all supported types', async () => {
        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ name: { $lte: 'John' } });
        }).toThrow("unexpected value for operator $lte at '$.name.$lte'");

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $lte: 30 } }),
        );
        expect(testAge.total).toEqual(1);
        expect(testAge.documents[0].value).toEqual(data);

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $lte: true } });
        }).toThrow("unexpected value for operator $lte at '$.is_active.$lte'");

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $lte: new Date('1990-01-01') } }),
        );
        expect(testBirthDate.total).toEqual(1);
        expect(testBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$in', () => {
      test('should support all supported types', async () => {
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: { $in: ['John'] } }),
        );
        expect(testName.total).toEqual(1);
        expect(testName.documents[0].value).toEqual(data);

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $in: [30] } }),
        );
        expect(testAge.total).toEqual(1);
        expect(testAge.documents[0].value).toEqual(data);

        const testIsActive = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ is_active: { $in: [true] } }),
        );
        expect(testIsActive.total).toEqual(1);
        expect(testIsActive.documents[0].value).toEqual(data);

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $in: [new Date('1990-01-01')] } }),
        );
        expect(testBirthDate.total).toEqual(1);
        expect(testBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$nin', () => {
      test('should support all supported types', async () => {
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: { $nin: ['John'] } }),
        );
        expect(testName.total).toEqual(0);

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $nin: [30] } }),
        );
        expect(testAge.total).toEqual(0);

        const testIsActive = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ is_active: { $nin: [true] } }),
        );
        expect(testIsActive.total).toEqual(0);

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ birth_date: { $nin: [new Date('1990-01-01')] } }),
        );
        expect(testBirthDate.total).toEqual(0);
      });
    });

    describe('$exists', () => {
      test('should not be supported', async () => {
        expect(() => {
          toRedisSearch<Person>({ name: { $exists: true } });
        }).toThrow("'$exists' operator not supported at '$.name.$exists'");

        expect(() => {
          toRedisSearch<Person>({ age: { $exists: true } });
        }).toThrow("'$exists' operator not supported at '$.age.$exists'");

        expect(() => {
          toRedisSearch<Person>({ is_active: { $exists: true } });
        }).toThrow("'$exists' operator not supported at '$.is_active.$exists'");

        expect(() => {
          toRedisSearch<Person>({ birth_date: { $exists: true } });
        }).toThrow(
          "'$exists' operator not supported at '$.birth_date.$exists'",
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
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: { $like: 'Jo' } }),
        );
        expect(testName.total).toEqual(1);
        expect(testName.documents[0].value).toEqual(data);

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ age: { $like: 30 } });
        }).toThrow("unexpected value for operator $like at '$.age.$like'");

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ is_active: { $like: true } });
        }).toThrow(
          "unexpected value for operator $like at '$.is_active.$like'",
        );

        expect(() => {
          //@ts-ignore
          toRedisSearch<Person>({ birth_date: { $like: new Date('1990-01-01') } });
        }).toThrow(
          "unexpected value for operator $like at '$.birth_date.$like'",
        );
      });
    });

    describe('$not', () => {
      test('should support all supported types', async () => {
        const testName = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ name: { $not: { $eq: 'John' } } }),
        );
        expect(testName.total).toEqual(0);

        const testAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ age: { $not: { $eq: 30 } } }),
        );
        expect(testAge.total).toEqual(0);

        const testIsActive = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({ is_active: { $not: { $eq: true } } }),
        );
        expect(testIsActive.total).toEqual(0);

        const testBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            birth_date: { $not: { $eq: new Date('1990-01-01') } },
          }),
        );
        expect(testBirthDate.total).toEqual(0);
      });
    });

    describe('$and', () => {
      test('should support all supported types', async () => {
        const testNameAndAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $and: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          }),
        );
        expect(testNameAndAge.total).toEqual(1);
        expect(testNameAndAge.documents[0].value).toEqual(data);

        const testIsActiveAndBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $and: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          }),
        );
        expect(testIsActiveAndBirthDate.total).toEqual(1);
        expect(testIsActiveAndBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$or', () => {
      test('should support all supported types', async () => {
        const testNameOrAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $or: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          }),
        );
        expect(testNameOrAge.total).toEqual(1);
        expect(testNameOrAge.documents[0].value).toEqual(data);

        const testIsActiveOrBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $or: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          }),
        );
        expect(testIsActiveOrBirthDate.total).toEqual(1);
        expect(testIsActiveOrBirthDate.documents[0].value).toEqual(data);
      });
    });

    describe('$nor', () => {
      test('should support all supported types', async () => {
        const testNameNorAge = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $nor: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
          }),
        );
        expect(testNameNorAge.total).toEqual(0);

        const testIsActiveNorBirthDate = await redisClient.ft.search(
          'idx:users',
          ...toRedisSearch<Person>({
            $nor: [
              { is_active: { $eq: true } },
              { birth_date: { $eq: new Date('1990-01-01') } },
            ],
          }),
        );
        expect(testIsActiveNorBirthDate.total).toEqual(0);
      });
    });
  });
});
