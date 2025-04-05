import { after, before, describe, test } from 'node:test'
import { expect } from 'expect';
import filter from './index';
import { QueryValidationError } from '@criterium/core';
import init, { User } from './testDB';
import data from './seed'

describe('operators', () => {
  let db: Awaited<ReturnType<typeof init>>

  before(async () => {
    db = await init();
  });

  after(async () => {
    await db.destroy();
  });

  describe('empty query', () => {
    test('should match everything', async () => {
      const query = filter(db.getBaseQuery(), {});
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data);
    });
  });

  describe('$limit', () => {
    test('no data return', async () => {
      const query = filter(db.getBaseQuery(), { $limit: 0 });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual([]);
    });

    test('partial return', async () => {
      const query = filter(db.getBaseQuery(), { $limit: 10 });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data.slice(0, 10));
    });
  });

  describe('$skip', () => {
    test('no data return', async () => {
      const query = filter(db.getBaseQuery(), { $skip: data.length });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual([]);
    });

    test('partial return', async () => {
      const query = filter(db.getBaseQuery(), { $skip: data.length - 10 });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data.slice(data.length - 10));
    });
  });

  describe('$sort', () => {
    test('string supported', async () => {
      const query = filter(db.getBaseQuery(), { $sort: { name: 1 } });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data.slice(0).sort((a, b) => a.name.localeCompare(b.name)));
    });

    test('number supported', async () => {
      const query = filter(db.getBaseQuery(), { $sort: { age: 1 } });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data.slice(0).sort((a, b) => a.age - b.age));
    });

    test('boolean supported', async () => {
      const query = filter(db.getBaseQuery(), { $sort: { is_active: 1 } });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query) as Array<User>;
      // check if every active user are grouped at the end
      const firstActive = results.findIndex(u => u.is_active);
      expect(results.slice(firstActive).every(u => u.is_active)).toEqual(true);
    });

    test('date supported', async () => {
      const query = filter(db.getBaseQuery(), { $sort: { birth_date: 1 } });
      if (query instanceof QueryValidationError) throw query;
      const results = await db.getResults(query);
      expect(results).toEqual(data.slice(0).sort((a, b) => a.birth_date.getTime() - b.birth_date.getTime()));
    });

  });

  describe('filter', () => {
    
    describe('$eq', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: "Alice Johnson" });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.name === "Alice Johnson"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: 25 });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age === 25 ));
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: true });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.is_active === true ));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: new Date("1999-03-12") });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() === new Date("1999-03-12").getTime() ));
      });
    });

    describe('$ne', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $ne: "Alice Johnson" } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.name !== "Alice Johnson"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $ne: 25 }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age !== 25 ));
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: { $ne: true }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.is_active !== true ));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $ne: new Date("1999-03-12") }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() !== new Date("1999-03-12").getTime() ));
      });

    });

    describe('$gt', () => {
      test('string not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { name: { $gt: "Alice Johnson" } });
        expect(query).toEqual(new Error("unexpected value for operator $gt at '$.name.$gt'"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $gt: 25 }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age > 25 ));
      });

      test('boolean not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { is_active: { $gt: true }  });
        expect(query).toEqual(new Error("unexpected value for operator $gt at '$.is_active.$gt'"));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $gt: new Date("1999-03-12") }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() > new Date("1999-03-12").getTime() ));
      });
    });

    describe('$gte', () => {
      test('string not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { name: { $gte: "Alice Johnson" } });
        expect(query).toEqual(new Error("unexpected value for operator $gte at '$.name.$gte'"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $gte: 25 }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age >= 25 ));
      });

      test('boolean not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { is_active: { $gte: true }  });
        expect(query).toEqual(new Error("unexpected value for operator $gte at '$.is_active.$gte'"));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $gte: new Date("1999-03-12") }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() >= new Date("1999-03-12").getTime() ));
      });
    });

    describe('$lt', () => {
      test('string not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { name: { $lt: "Alice Johnson" } });
        expect(query).toEqual(new Error("unexpected value for operator $lt at '$.name.$lt'"));
      });
    
      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $lt: 25 }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age < 25 ));
      });
    
      test('boolean not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { is_active: { $lt: true }  });
        expect(query).toEqual(new Error("unexpected value for operator $lt at '$.is_active.$lt'"));
      });
    
      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $lt: new Date("1999-03-12") }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() < new Date("1999-03-12").getTime() ));
      });
    });
    
    describe('$lte', () => {
      test('string not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { name: { $lte: "Alice Johnson" } });
        expect(query).toEqual(new Error("unexpected value for operator $lte at '$.name.$lte'"));
      });
    
      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $lte: 25 }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age <= 25 ));
      });
    
      test('boolean not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { is_active: { $lte: true }  });
        expect(query).toEqual(new Error("unexpected value for operator $lte at '$.is_active.$lte'"));
      });
    
      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $lte: new Date("1999-03-12") }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() <= new Date("1999-03-12").getTime() ));
      });
    });

    describe('$in', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $in: ["Alice Johnson"] } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.name === "Alice Johnson"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $in: [25] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age === 25 ));
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: { $in: [true] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.is_active === true ));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $in: [new Date("1999-03-12")] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() === new Date("1999-03-12").getTime() ));
      });
    });

    describe('$nin', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $nin: ["Alice Johnson"] } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.name !== "Alice Johnson"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $nin: [25] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age !== 25 ));
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: { $nin: [true] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.is_active !== true ));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $nin: [new Date("1999-03-12")] }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() !== new Date("1999-03-12").getTime() ));
      });
    });

    describe('$exists', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $exists: true } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data);
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $exists: false }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual([]);
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: { $exists: true }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data);
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $exists: false }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual([]);
      });
    });

    describe('$like', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $like: 'Alice %' } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => /Alice .*/i.test(user.name)));
      });

      test('number not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { age: { $like: 25 } });
        expect(query).toEqual(new Error("unexpected value for operator $like at '$.age.$like'"));
      });

      test('boolean not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { is_active: { $like: true } });
        expect(query).toEqual(new Error("unexpected value for operator $like at '$.is_active.$like'"));
      });

      test('date not supported', async () => {
        //@ts-ignore
        const query = filter(db.getBaseQuery(), { birth_date: { $like: new Date("1999-03-12") } });
        expect(query).toEqual(new Error("unexpected value for operator $like at '$.birth_date.$like'"));
      });

    });

    describe('$not', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { name: { $not: { $eq: "Alice Johnson" } } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.name !== "Alice Johnson"));
      });

      test('number supported', async () => {
        const query = filter(db.getBaseQuery(), { age: { $not: { $eq: 25 } } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.age !== 25 ));
      });

      test('boolean supported', async () => {
        const query = filter(db.getBaseQuery(), { is_active: { $not: { $eq: true } }  });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.is_active !== true ));
      });

      test('date supported', async () => {
        const query = filter(db.getBaseQuery(), { birth_date: { $not: { $eq: new Date("1999-03-12") } } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.birth_date.getTime() !== new Date("1999-03-12").getTime() ));
      });
    });

    describe('$all', () => {
      test('string supported', async () => {
        const query = filter(db.getBaseQuery(), { interests: { $all: [ "cooking", "gaming"] } });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => user.interests.indexOf("cooking") !== -1 && user.interests.indexOf("gaming") !== -1));
      });
    });

    describe('$and', () => {
      test('should support all supported types', async () => {
        const query = filter(db.getBaseQuery(), {
          $and: [
            { name: { $like: 'Alice%' } },
            { age: { $lte: 40 } },
            { is_active: { $eq: true } },
            { birth_date: { $gt: new Date("1990-01-01") } },
            { interests: { $all: ["reading", "traveling"] } },
          ]
        });
        
        if (query instanceof QueryValidationError) throw query;

        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => {
          return /Alice.*/.test(user.name)
          && user.age <= 40
          && user.is_active === true
          && user.birth_date.getTime() > new Date("1990-01-01").getTime()
          && user.interests.indexOf("reading") !== -1 && user.interests.indexOf("traveling") !== -1
        }));
      });
    });

    describe('$or', () => {
      test('should support all supported types', async () => {
        const query = filter(db.getBaseQuery(), {
          $or: [
            { name: { $like: 'Alice%' } },
            { age: { $lte: 40 } },
            { is_active: { $eq: true } },
            { birth_date: { $gt: new Date("1990-01-01") } },
            { interests: { $all: ["reading", "traveling"] } },
          ]
        });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => {
          return /Alice.*/.test(user.name)
          || user.age <= 40
          || user.is_active === true
          || user.birth_date.getTime() > new Date("1990-01-01").getTime()
          || user.interests.indexOf("reading") !== -1 && user.interests.indexOf("traveling") !== -1
        }));
      });
    });

    describe('$nor', () => {
      test('should support all supported types', async () => {
        const query = filter(db.getBaseQuery(), {
          $nor: [
            { name: { $like: 'Alice%' } },
            { age: { $lte: 40 } },
            { is_active: { $eq: true } },
            { birth_date: { $gt: new Date("1990-01-01") } },
            { interests: { $all: ["reading", "traveling"] } },
          ]
        });
        if (query instanceof QueryValidationError) throw query;
        const results = await db.getResults(query);
        expect(results).toEqual(data.filter(user => {
          return !/Alice.*/.test(user.name)
          && !(user.age <= 40)
          && !(user.is_active === true)
          && !(user.birth_date.getTime() > new Date("1990-01-01").getTime())
          && !(user.interests.indexOf("reading") !== -1 && user.interests.indexOf("traveling") !== -1)
        }));
      });
    });
    
  });
});
