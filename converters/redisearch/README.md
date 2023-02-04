# @criterium/redissearch

@criterium/redissearch is a component of the Criterium project that provides a converter for Redisearch. This component makes it easy to extract data from Redis databases that have been indexed with Redisearch.

With @criterium/redisearch, you can translate your Criterium queries into Redisearch-compatible search queries, and extract data from your Redis databases with ease. This component provides a simple and intuitive interface for working with Redisearch, and makes it easy to extract the information you need from your Redis databases.

## install

```sh
npm i @criterium/redisearch
```

## usage

```ts
import { createClient, SchemaFieldTypes } from 'redis';
import toRedisSearch from '@criterium/redisearch';

const client = createClient();
await client.connect();

await redisClient.json.set('users:1', '$', {
  name: 'John',
});

await redisClient.ft.create(
  'idx:users',
  {
    '$.name': {
      type: SchemaFieldTypes.TEXT,
      SORTABLE: true,
      AS: 'name',
    },
  },
  {
    ON: 'JSON',
    PREFIX: 'users',
  },
);

const result = await redisClient.ft.search(
  'idx:users',
  ...toRedisSearch({ name: 'John' }),
);
// { total: 1, documents:[{...}] }
```
