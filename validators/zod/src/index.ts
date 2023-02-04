import z from 'zod';
import type { CriteruimQuery, CriteruimExpression } from '@criterium/core';

export type { CriteruimQuery };

export function queryOf<S extends z.ZodObject<any>>(
  schema: S,
): z.Schema<CriteruimQuery<z.infer<S>>> {
  const query: any = z.object({
    $and: z.array(z.lazy(() => query)).optional(),
    $or: z.array(z.lazy(() => query)).optional(),
    $nor: z.array(z.lazy(() => query)).optional(),
  });

  return query.merge(expressionOf(schema)).strict();
}

function expressionOf<S extends z.Schema<any>>(
  schema: S,
): z.Schema<CriteruimExpression<z.infer<S>>> {
  let expression: z.Schema<any>;
  const alternatives: z.ZodTypeAny[] = [];

  const baseObject = z.object({
    $not: z.lazy(() => expression).optional(),
    $exists: z.boolean().optional(),
  });

  if (schema instanceof z.ZodObject) {
    alternatives.push(
      baseObject
        .merge(
          z.object({
            ...Object.keys(schema.shape).reduce((obj, key) => {
              obj[key] = expressionOf(schema.shape[key]).optional();
              return obj;
            }, {} as any),
          }),
        )
        .strict(),
    );
  } else if (schema instanceof z.ZodArray) {
    alternatives.push(
      baseObject
        .merge(
          z.object({
            $all: schema.optional(),
          }),
        )
        .strict(),
    );
  } else if (schema instanceof z.ZodNumber) {
    alternatives.push(schema);

    alternatives.push(
      baseObject
        .merge(
          z.object({
            $gt: z.number().optional(),
            $gte: z.number().optional(),
            $lt: z.number().optional(),
            $lte: z.number().optional(),
            $in: z.array(z.number()).optional(),
            $nin: z.array(z.number()).optional(),
            $eq: z.number().optional(),
            $ne: z.number().optional(),
          }),
        )
        .strict(),
    );
  } else if (schema instanceof z.ZodString) {
    alternatives.push(schema);

    alternatives.push(
      baseObject
        .merge(
          z.object({
            $in: z.array(z.string()).optional(),
            $nin: z.array(z.string()).optional(),
            $eq: z.string().optional(),
            $ne: z.string().optional(),
            $like: z.string().optional(),
          }),
        )
        .strict(),
    );
  }

  expression =
    alternatives.length == 1
      ? alternatives[0]
      : z.union(
          alternatives as unknown as readonly [z.ZodTypeAny, z.ZodTypeAny],
        );

  return expression;
}
