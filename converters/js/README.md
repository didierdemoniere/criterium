# @criterium/js

@criterium/js is a component of the Criterium project that provides a predicate builder for filtering JavaScript arrays.

With @criterium/js, you can build predicates using an intuitive and expressive syntax, and use them to filter arrays of data based on specific criteria.

## install

```sh
npm i @criterium/js
```

## usage

```ts
import toPredicate from '@criterium/js';

const data = [
  {
    name: 'John',
    address: {
      city: 'SF',
    },
  },
];

const result = data.filter(
  toPredicate({
    address: {
      city: {
        $in: ['SF', 'NY'],
      },
    },
  }),
);
// result.length => 1
```
