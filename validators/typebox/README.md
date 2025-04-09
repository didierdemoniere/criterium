# @criterium/typebox

@criterium/typebox create typebox query schema for given typebox entity schema.

## install

```sh
npm i @criterium/typebox
```

## usage

```ts
import { Type as t } from '@sinclair/typebox';
import { queryOf } from '@criterium/typebox';
import { Value } from '@sinclair/typebox/value';

const User = t.Object({
  name: t.String(),
  address: t.Object({
    street: t.String(),
  }),
});

const UserQuery = queryOf(User);

Value.Check(UserQuery, {
  address: {
    street: {
      $in: ['SF', 'NY'],
    },
  },
})
// success

Value.Check(UserQuery, {
  is_admin: {
    $eq: true,
  },
})
// fail
```
