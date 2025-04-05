# @criterium/core

an agnostic helper to create mongo-like filter.

## install

```sh
npm i @criterium/core
```

## usage

```ts
import { converter } from '@criterium/core';

const where = converter({
  operators: {
    $and: (_, __, children) => children.join(' '),
    $eq: ([prop], value) => `${prop} = "${value}"`,
    ...
  }
})

where({
  name: 'John'
})
// name = "John"

```
