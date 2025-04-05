# @criterium/kysely

@criterium/kysely allow to add filter, sort and pagination to kysely queries using mongo-like syntax.

## install

```sh
npm i @criterium/kysely
```

## usage

```ts
import customize, { QueryValidationError } from '@criterium/kysely';
import { db } from './db';

const query = customize(db.selectFrom('posts').selectAll(), {
  $and: [
    { created: { $gte: new Date("2025-01-01") } },
    { title: { $like: 'bitcoin %' } },
  ],
  $sort: { created: -1 },
  $limit: 15
});

if (query instanceof QueryValidationError) throw query;
//or if (query instanceof Error) throw query;

const results = await query.execute();
console.log(results);
```
