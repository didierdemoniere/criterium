# @criterium/zod

@criterium/zod create zod query schema for given zod entity schema.

## install

```sh
npm i @criterium/zod
```

## usage

```ts
import { z } from 'zod';
import { queryOf } from '@criterium/zod';

const User = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
  }),
});

const UserQuery = queryOf(User);

UserQuery.safeParse({
  address: {
    street: {
      $in: ['SF', 'NY'],
    },
  },
});
// success

UserQuery.safeParse({
  is_admin: {
    $eq: true,
  },
});
// fail
```
