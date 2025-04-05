# @criterium/redisearch

@criterium/redisearch allow to add filter, sort and pagination to redis search queries using mongo-like syntax.

## install

```sh
npm i @criterium/redisearch
```

## usage

```ts
import { createClient, SchemaFieldTypes } from 'redis';
import customize, { QueryValidationError }  from '@criterium/redisearch';

const client = createClient();
await client.connect();

await redisClient.json.set('posts:0', '$', { 
  created: new Date("2025-02-01").getTime(), 
  title: 'will bitcoin continue to fall ?' 
});

await redisClient.json.set('posts:1', '$', { 
  created: new Date("2025-02-15").getTime(), 
  title: 'can solana hold this time ?'
});

await redisClient.json.set('posts:2', '$', { 
  created: new Date("2024-03-15").getTime(), 
  title: 'solana vs bitcoin vs ethereum'
});

await redisClient.ft.create(
  'idx:posts',
  {
    '$.created': {
      type: SchemaFieldTypes.NUMERIC,
      SORTABLE: true,
      AS: 'created',
    },
    '$.title': {
      type: SchemaFieldTypes.TEXT,
      SORTABLE: true,
      AS: 'title',
    },
  },
  {
    ON: 'JSON',
    PREFIX: 'posts',
  },
);

const query = customize(['idx:posts'], {
  $and: [
    { created: { $gte: new Date("2025-01-01") } },
    { title: { $like: 'bitcoin %' } },
  ],
  $sort: { created: -1 },
  $limit: 15
});

if (query instanceof QueryValidationError) throw query;
//or if (query instanceof Error) throw query;

const result = await redisClient.ft.search(...query);
console.log(results);
// { total: 1, documents:[{...}] }
```
