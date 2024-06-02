# @criterium/kysely

@criterium/kysely allow to use mongo-like filters with kysely

## install

```sh
npm i @criterium/kysely
```

## usage

```ts
import filter from '@criterium/kysely';
import { db } from '/db';

const results = await db.selectFrom('person')
  .selectAll()
  .where(filter({
    name: { 
      $in: ['John'] 
    }
  })).execute();
```
