# @criterium/js

@criterium/js allow you to filter, sort and paginate JavaScript arrays using mongo-like syntax.

## install

```sh
npm i @criterium/js
```

## usage

```ts
import filter, { QueryValidationError } from '@criterium/js';

const list = [
  { created: new Date("2025-02-01"), title: 'will bitcoin continue to fall ?' },
  { created: new Date("2025-02-15"), title: 'can solana hold this time ?' },
  { created: new Date("2024-03-15"), title: 'solana vs bitcoin vs ethereum' },
];

const results = filter(list, {
  $and: [
    { created: { $gte: new Date("2025-01-01") } },
    { title: { $like: 'bitcoin.*' } },
  ],
  $sort: { created: -1 },
  $limit: 15
});

if (results instanceof QueryValidationError) throw results;
//or if (results instanceof Error) throw results;

console.log(results);
```
