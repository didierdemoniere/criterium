import { type TObject, type Static, type JavaScriptTypeBuilder, type TUnsafe, type TSchema } from '@sinclair/typebox';
import type { CriteruimQuery } from '@criterium/core';
export type { CriteruimQuery };

export function queryOf<S extends TObject>(
  t: JavaScriptTypeBuilder,
  schema: S,
): TUnsafe<CriteruimQuery<Static<S>>> {
  
  return t.Intersect([
    filterOf(t, schema),
    t.Object({
      $sort: t.Optional(sorterOf(t, schema)),
      $skip: t.Optional(t.Number()),
      $limit: t.Optional(t.Number())
    })
  ], { unevaluatedProperties: false }) as any;
}

function filterOf<S extends TObject>(
  t: JavaScriptTypeBuilder,
  schema: S,
) {
  return t.Recursive((thisType) => {
    return t.Intersect([
      expressionOf(t, schema, true),
      t.Object({
        $and: t.Optional(t.Array(thisType)),
        $or: t.Optional(t.Array(thisType)),
        $nor: t.Optional(t.Array(thisType)),
      }),
    ])
  })
}

function sorterOf<S extends TObject>(
  t: JavaScriptTypeBuilder,
  schema: S,
) {
  return t.Object({
    ...Object.keys(schema.properties).reduce((obj, key) => {
      obj[key] = t.Optional(t.Union([t.Literal(1), t.Literal(-1)]));
      return obj;
    }, {} as any)
  }, { additionalProperties: false });
}


function expressionOf<S extends TSchema>(
  t: JavaScriptTypeBuilder,
  schema: S,
  additionalProperties = false
): TSchema {
  return t.Recursive(thisType => {
    if (schema.type === 'object') {
        return t.Object({
          ...Object.keys(schema.properties).reduce((obj, key) => {
            obj[key] = t.Optional(expressionOf(t, schema.properties[key]));
            return obj;
          }, {} as any),
          $not: t.Optional(thisType),
          $exists: t.Optional(t.Boolean()),
        }, { additionalProperties })
    } 
    else if (schema.type === 'array') {
        return t.Object({
          $not: t.Optional(thisType),
          $exists: t.Optional(t.Boolean()),
          $all: t.Optional(schema),
        }, { additionalProperties })
    } 
    else if (schema.type === 'string') {
      return t.Union([
        schema,
        t.Object({
          $not: t.Optional(thisType),
          $exists: t.Optional(t.Boolean()),
          $in: t.Optional(t.Array(schema)),
          $nin: t.Optional(t.Array(schema)),
          $eq: t.Optional(schema),
          $ne: t.Optional(schema),
          $like: t.Optional(schema),
        }, { additionalProperties })
      ])
    } 
    else if (schema.type === 'number' || schema.type === 'integer' || schema.type === 'Date' || schema.type === 'bigint') {
      return t.Union([
        schema,
        t.Object({
          $not: t.Optional(thisType),
          $exists: t.Optional(t.Boolean()),
          $gt: t.Optional(schema),
          $gte: t.Optional(schema),
          $lt: t.Optional(schema),
          $lte: t.Optional(schema),
          $in: t.Optional(t.Array(schema)),
          $nin: t.Optional(t.Array(schema)),
          $eq: t.Optional(schema),
          $ne: t.Optional(schema),
        }, { additionalProperties })
      ])
    }  else  {
      return t.Union([
        schema,
        t.Object({
          $not: t.Optional(thisType),
          $exists: t.Optional(t.Boolean()),
          $eq: t.Optional(schema),
          $ne: t.Optional(schema),
          $in: t.Optional(t.Array(schema)),
          $nin: t.Optional(t.Array(schema))
        }, { additionalProperties })
      ])
    }
  })
}
