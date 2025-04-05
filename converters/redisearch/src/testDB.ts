import { SchemaFieldTypes, SearchOptions } from 'redis';
import { connectingClient } from './redis';
import seed from './seed';

export interface User {
  name: string;
  age: number;
  is_active: boolean;
  birth_date: number | Date;
  interests: Array<string>
}

export interface DB {
  user: User
}

export default async function initDB() {
  const redisClient = await connectingClient;

  await Promise.all(seed.map((data, id) => {
    return redisClient.json.set(`users:${id}`, '$', {
      ...data,
      birth_date: data.birth_date.getTime()
    })
  }));

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
        SORTABLE: true,
        AS: 'birth_date',
      },
      '$.interests': {
        type: SchemaFieldTypes.TAG,
        AS: 'interests',
      },
    },
    {
      ON: 'JSON',
      PREFIX: 'users',
    },
  );

  return {
    getBaseQuery: () => ['idx:users'] as [string],
    getResults: async (query: [string, string, SearchOptions], reorder = false) => {
      const result = await redisClient.ft.search(...query);
      const documents = result.documents;
      if (reorder) {
        documents.sort((a,b) => Number(a.id.split(':').pop()) > Number(b.id.split(':').pop()) ? 1 : -1);
      }
      return documents.map(({ value }) => {
        return {...value, birth_date: new Date(value.birth_date as number)} as unknown as User
      });
    },
    destroy: async () => await redisClient.disconnect()
  }
}

