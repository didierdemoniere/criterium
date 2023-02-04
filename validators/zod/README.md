# @criterium/zod

@criterium/zod is a component of the Criterium project that provides a tool to transform a Zod entity schema into a Criterium query schema. This component makes it easy to take advantage of the robust type checking and validation features offered by Zod, and apply them to your Criterium queries.

With @criterium/zod, you can define your entity schema using the familiar and intuitive Zod syntax, and then easily convert it into a Criterium query schema that can be used to extract data from databases and search engines. The resulting schema ensures that your queries are well-formed and adhere to the constraints defined in the Zod entity schema, helping to prevent errors and improve the reliability of your data extraction process.

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
