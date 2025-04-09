import { TObject, type Static, Type as t, TUnsafe, TSchema } from '@sinclair/typebox';
import type { CriteruimQuery } from '@criterium/core';
export type { CriteruimQuery };

export function queryOf<S extends TObject<any>>(
  schema: S,
): TUnsafe<CriteruimQuery<Static<S>>> {
  
  return t.Intersect([
    filterOf(schema),
    t.Object({
      $sort: t.Optional(sorterOf(schema)),
      $skip: t.Optional(t.Number()),
      $limit: t.Optional(t.Number())
    })
  ], { unevaluatedProperties: false }) as any;
}

function filterOf<S extends TObject<any>>(
  schema: S,
) {
  return t.Intersect([
    t.Recursive((thisType) => {
      return t.Object({
        $and: t.Optional(t.Array(thisType)),
        $or: t.Optional(t.Array(thisType)),
        $nor: t.Optional(t.Array(thisType)),
      })
    }),
    expressionOf(schema)
  ])
}

function sorterOf<S extends TObject<any>>(
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
  schema: S,
): TSchema {
  return t.Recursive(thisType => {
    const alternatives: TSchema[] = [];
    
    const commonProps = {
      $not: t.Optional(thisType),
      $exists: t.Optional(t.Boolean()),
    }

    if (schema.type === 'object') {
      alternatives.push(
        t.Object({
          ...commonProps,
          ...Object.keys(schema.properties).reduce((obj, key) => {
            obj[key] = t.Optional(expressionOf(schema.properties[key]));
            return obj;
          }, {} as any),
        }, { additionalProperties: false })
      );
    } else if (schema.type === 'array') {
      alternatives.push(
        t.Object({
        ...commonProps,
        $all: t.Optional(schema),
        }, { additionalProperties: false })
      );
    } else if (schema.type === 'number') {
      alternatives.push(schema);
  
      alternatives.push(
          t.Object({
            ...commonProps,
            $gt: t.Optional(t.Number()),
            $gte: t.Optional(t.Number()),
            $lt: t.Optional(t.Number()),
            $lte: t.Optional(t.Number()),
            $in: t.Optional(t.Array(t.Number())),
            $nin: t.Optional(t.Array(t.Number())),
            $eq: t.Optional(t.Number()),
            $ne: t.Optional(t.Number()),
          }, { additionalProperties: false })
      );
    } else if (schema.type === 'string') {
      alternatives.push(schema);
  
      alternatives.push(
        t.Object({
          ...commonProps,
          $in: t.Optional(t.Array(t.String())),
          $nin: t.Optional(t.Array(t.String())),
          $eq: t.Optional(t.String()),
          $ne: t.Optional(t.String()),
          $like: t.Optional(t.String()),
        }, { additionalProperties: false })
      );
    }

    return alternatives.length == 1
      ? alternatives[0]
      : t.Union(alternatives);
  })

}
