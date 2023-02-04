# @criterium/core

@criterium/core is a component of the Criterium project that provides a factory for creating database specific converters. This component is the foundation of Criterium, and is designed to provide a flexible and scalable solution to provide support for various databases and search engines.

With @criterium/core, you can create custom converters, and use them to translate Criterium queries into the appropriate format for the target database. This allows you to work with a wide variety of data sources.

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
