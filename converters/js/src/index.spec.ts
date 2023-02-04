import toPredicate from './index';

const data = {
  name: 'John',
  age: 30,
  is_active: true,
  birth_date: new Date('1990-01-01'),
};

describe('operators', () => {
  describe('$eq', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: 'John' });
      expect(testName(data)).toEqual(true);

      const testAge = toPredicate({ age: 30 });
      expect(testAge(data)).toEqual(true);

      const testIsActive = toPredicate({ is_active: true });
      expect(testIsActive(data)).toEqual(true);

      const testBirthDate = toPredicate({ birth_date: new Date('1990-01-01') });
      expect(testBirthDate(data)).toEqual(true);
    });
  });

  describe('$ne', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $ne: 'John' } });
      expect(testName(data)).toEqual(false);

      const testAge = toPredicate({ age: { $ne: 30 } });
      expect(testAge(data)).toEqual(false);

      const testIsActive = toPredicate({ is_active: { $ne: true } });
      expect(testIsActive(data)).toEqual(false);

      const testBirthDate = toPredicate({
        birth_date: { $ne: new Date('1990-01-01') },
      });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$gt', () => {
    test('should support all supported types', async () => {
      expect(() => {
        toPredicate({ name: { $gt: 'John' } });
      }).toThrow("unexpected value for operator $gt at '$.name.$gt'");

      const testAge = toPredicate({ age: { $gt: 30 } });
      expect(testAge(data)).toEqual(false);

      expect(() => {
        toPredicate({ is_active: { $gt: true } });
      }).toThrow("unexpected value for operator $gt at '$.is_active.$gt'");

      const testBirthDate = toPredicate({
        birth_date: { $gt: new Date('1990-01-01') },
      });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$gte', () => {
    test('should support all supported types', async () => {
      expect(() => {
        toPredicate({ name: { $gte: 'John' } });
      }).toThrow("unexpected value for operator $gte at '$.name.$gte'");

      const testAge = toPredicate({ age: { $gte: 30 } });
      expect(testAge(data)).toEqual(true);

      expect(() => {
        toPredicate({ is_active: { $gte: true } });
      }).toThrow("unexpected value for operator $gte at '$.is_active.$gte'");

      const testBirthDate = toPredicate({
        birth_date: { $gte: new Date('1990-01-01') },
      });
      expect(testBirthDate(data)).toEqual(true);
    });
  });

  describe('$lt', () => {
    test('should support all supported types', async () => {
      expect(() => {
        toPredicate({ name: { $lt: 'John' } });
      }).toThrow("unexpected value for operator $lt at '$.name.$lt'");

      const testAge = toPredicate({ age: { $lt: 30 } });
      expect(testAge(data)).toEqual(false);

      expect(() => {
        toPredicate({ is_active: { $lt: true } });
      }).toThrow("unexpected value for operator $lt at '$.is_active.$lt'");

      const testBirthDate = toPredicate({
        birth_date: { $lt: new Date('1990-01-01') },
      });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$lte', () => {
    test('should support all supported types', async () => {
      expect(() => {
        toPredicate({ name: { $lte: 'John' } });
      }).toThrow("unexpected value for operator $lte at '$.name.$lte'");

      const testAge = toPredicate({ age: { $lte: 30 } });
      expect(testAge(data)).toEqual(true);

      expect(() => {
        toPredicate({ is_active: { $lte: true } });
      }).toThrow("unexpected value for operator $lte at '$.is_active.$lte'");

      const testBirthDate = toPredicate({
        birth_date: { $lte: new Date('1990-01-01') },
      });
      expect(testBirthDate(data)).toEqual(true);
    });
  });

  describe('$in', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $in: ['John'] } });
      expect(testName(data)).toEqual(true);

      const testAge = toPredicate({ age: { $in: [30] } });
      expect(testAge(data)).toEqual(true);

      const testIsActive = toPredicate({ is_active: { $in: [true] } });
      expect(testIsActive(data)).toEqual(true);

      const testBirthDate = toPredicate({
        birth_date: { $in: [new Date('1990-01-01')] },
      });
      expect(testBirthDate(data)).toEqual(true);
    });
  });

  describe('$nin', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $nin: ['John'] } });
      expect(testName(data)).toEqual(false);

      const testAge = toPredicate({ age: { $nin: [30] } });
      expect(testAge(data)).toEqual(false);

      const testIsActive = toPredicate({ is_active: { $nin: [true] } });
      expect(testIsActive(data)).toEqual(false);

      const testBirthDate = toPredicate({
        birth_date: { $nin: [new Date('1990-01-01')] },
      });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$exists', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $exists: true } });
      expect(testName(data)).toEqual(true);

      const testAge = toPredicate({ age: { $exists: false } });
      expect(testAge(data)).toEqual(false);

      const testIsActive = toPredicate({ is_active: { $exists: true } });
      expect(testIsActive(data)).toEqual(true);

      const testBirthDate = toPredicate({ birth_date: { $exists: false } });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$all', () => {
    const couple = {
      name: ['John', 'Jane'],
      age: [30, 25],
      is_active: [true, false],
      birth_date: [new Date('1990-01-01'), new Date('1990-01-02')],
    };

    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $all: ['John', 'Jane'] } });
      expect(testName(couple)).toEqual(true);

      const testAge = toPredicate({ age: { $all: [30, 25] } });
      expect(testAge(couple)).toEqual(true);

      const testIsActive = toPredicate({ is_active: { $all: [true, false] } });
      expect(testIsActive(couple)).toEqual(true);

      const testBirthDate = toPredicate({
        birth_date: { $all: [new Date('1990-01-01'), new Date('1990-01-02')] },
      });
      expect(testBirthDate(couple)).toEqual(true);
    });
  });

  describe('$like', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $like: 'Jo.*' } });
      expect(testName(data)).toEqual(true);

      const testName2 = toPredicate({ name: { $like: /Jo.*/i } });
      expect(testName2(data)).toEqual(true);

      expect(() => {
        toPredicate({ age: { $like: 30 } });
      }).toThrow("unexpected value for operator $like at '$.age.$like'");

      expect(() => {
        toPredicate({ is_active: { $like: true } });
      }).toThrow("unexpected value for operator $like at '$.is_active.$like'");

      expect(() => {
        toPredicate({ birth_date: { $like: new Date('1990-01-01') } });
      }).toThrow("unexpected value for operator $like at '$.birth_date.$like'");
    });
  });

  describe('$not', () => {
    test('should support all supported types', async () => {
      const testName = toPredicate({ name: { $not: { $eq: 'John' } } });
      expect(testName(data)).toEqual(false);

      const testAge = toPredicate({ age: { $not: { $eq: 30 } } });
      expect(testAge(data)).toEqual(false);

      const testIsActive = toPredicate({ is_active: { $not: { $eq: true } } });
      expect(testIsActive(data)).toEqual(false);

      const testBirthDate = toPredicate({
        birth_date: { $not: { $eq: new Date('1990-01-01') } },
      });
      expect(testBirthDate(data)).toEqual(false);
    });
  });

  describe('$and', () => {
    test('should support all supported types', async () => {
      const testNameAndAge = toPredicate({
        $and: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
      });
      expect(testNameAndAge(data)).toEqual(true);

      const testIsActiveAndBirthDate = toPredicate({
        $and: [
          { is_active: { $eq: true } },
          { birth_date: { $eq: new Date('1990-01-01') } },
        ],
      });
      expect(testIsActiveAndBirthDate(data)).toEqual(true);
    });
  });

  describe('$or', () => {
    test('should support all supported types', async () => {
      const testNameOrAge = toPredicate({
        $or: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
      });
      expect(testNameOrAge(data)).toEqual(true);

      const testIsActiveOrBirthDate = toPredicate({
        $or: [
          { is_active: { $eq: true } },
          { birth_date: { $eq: new Date('1990-01-01') } },
        ],
      });
      expect(testIsActiveOrBirthDate(data)).toEqual(true);
    });
  });

  describe('$nor', () => {
    test('should support all supported types', async () => {
      const testNameNorAge = toPredicate({
        $nor: [{ name: { $eq: 'John' } }, { age: { $eq: 30 } }],
      });
      expect(testNameNorAge(data)).toEqual(false);

      const testIsActiveNorBirthDate = toPredicate({
        $nor: [
          { is_active: { $eq: true } },
          { birth_date: { $eq: new Date('1990-01-01') } },
        ],
      });
      expect(testIsActiveNorBirthDate(data)).toEqual(false);
    });
  });
});
