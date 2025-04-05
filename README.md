# Criterium

Criterium allow you to enrich database queries with mongo-style syntax.

## Why

query builders unlike orm allow to create optimized and safe queries, but they are not easily customisable.
mongo-style queries on the other end are easy to read, customize and serialize.

by levraging query builders as a foundation and mongo-style syntax it become easy to expose optimized, safe AND customisable API endpoint.

eg:
```js
// expertly crafted query
const crazySQLQuery = db.selectFrom('posts').selectAll();

// customisation sent by the client
const clientFilter = {
  $and: [
    { created: { $gte: new Date("2025-01-01") } },
    { content: { $like: '%bitcoin%' } },
  ],
  $sort: { created: -1 },
  $limit: 15
}:

// 🪄 tada
const query = customize(crazySQLQuery, clientFilter);
return query.execute();
```

## Status

### Converters
✅ Js array
✅ kysely
✅ redissearch

### Validators
✅ zod 

## Roadmap

### Converters
🔲 drizzle

### Validators
🔲 typebox
