import { converter, utils } from '@criterium/core';

const Datatypes = {
  TEXT: 'TEXT',
  NUMERIC: 'NUMERIC',
  TAG: 'TAG',
};

/**
 * redisSearch only allows alphanumeric characters and underscores
 * @see: https://redis.io/docs/stack/search/reference/escaping/
 */
const escape = utils.escape(/[^\w\d_]/);

const placeholder = (ctx, prop, val) => {
  ctx.redisearch.PARAMS[prop] = val;
  return `$${prop}`;
};

/**
 *
 * @see https://redis.io/docs/stack/search/indexing_json/#index-limitations
 * @param val
 * @returns
 */

const getType = (val: any) => {
  return typeof val === 'boolean'
    ? Datatypes.TAG
    : !isNaN(val)
    ? Datatypes.NUMERIC
    : Datatypes.TEXT;
};

const formatVariable = (variable, type) => {
  return type === Datatypes.NUMERIC
    ? `[${variable} ${variable}]`
    : type === Datatypes.TAG
    ? `{${variable}}`
    : `(${variable})`;
};

const coerce = (val: any) => {
  return typeof val !== 'boolean' && !isNaN(val) ? Number(val) : `${val}`;
};

export const converterOptions = {
  redisearch: {
    DIALECT: 2,
  },
};

export default converter({
  dataDepth: 1,
  operators: {
    $and: (_, __, children: string[]) => children.filter(Boolean).join(' '),
    $or: (_, __, children: string[]) =>
      `(${children.filter(Boolean).join('|')})`,
    $nor: (_, __, children: string[]) =>
      `-(${children.filter(Boolean).join('|')})`,
    $not: (_, __, children: string[]) =>
      `-(${children.filter(Boolean).join(' ')})`,
    $in: ([prop], __, children: any[], { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variables = children.map((value, id) =>
        placeholder(ctx, escapedProp + id, coerce(value)),
      );

      return `(${variables
        .map((variable, i) => {
          const type = getType(children[i]);
          return `@${escapedProp}:${formatVariable(variable, type)}`;
        })
        .join('|')})`;
    },
    // $all: ([prop], __, children: any[], { ctx }) => {
    //   const escapedProp = escape(prop.toString());
    //   const variables = children.map((value, id) =>
    //     placeholder(ctx, escapedProp + id, coerce(value)),
    //   );

    //   // return `@${escapedProp}:(${variables.join(' ')})`;

    //   return variables
    //     .map((variable, i) => {
    //       const type = getType(children[i]);
    //       return `@${escapedProp}:${formatVariable(variable, type)}`;
    //     })
    //     .join(' ');
    // },
    $nin: ([prop], __, children: any[], { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variables = children.map((value, i) =>
        placeholder(ctx, escapedProp + i, coerce(value)),
      );

      return `-(${variables
        .map((variable, i) => {
          const type = getType(children[i]);
          return `@${escapedProp}:${formatVariable(variable, type)}`;
        })
        .join('|')})`;
    },
    $gt: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variable = placeholder(ctx, escapedProp, Number(value));
      return `@${escapedProp}:[(${variable} +inf]`;
    },
    $gte: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variable = placeholder(ctx, escapedProp, Number(value));
      return `@${escapedProp}:[${variable} +inf]`;
    },
    $lt: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variable = placeholder(ctx, escapedProp, Number(value));
      return `@${escapedProp}:[-inf (${variable}]`;
    },
    $lte: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variable = placeholder(ctx, escapedProp, Number(value));
      return `@${escapedProp}:[-inf ${variable}]`;
    },
    $ne: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const type = getType(value);
      const variable = placeholder(ctx, escapedProp, coerce(value));
      return `-@${escapedProp}:${formatVariable(variable, type)}`;
    },
    $eq: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const type = getType(value);
      const variable = placeholder(ctx, escapedProp, coerce(value));
      return `@${escapedProp}:${formatVariable(variable, type)}`;
    },
    $like: ([prop], value, _, { ctx }) => {
      const escapedProp = escape(prop.toString());
      const variable = placeholder(ctx, escapedProp, coerce(value));
      return `@${escapedProp}:*${variable}*`;
    },
  },
  extendCtx: () => {
    return {
      redisearch: { DIALECT: converterOptions.redisearch.DIALECT, PARAMS: {} },
    } as {
      redisearch: {
        DIALECT: number;
        PARAMS: Record<string, any>;
      };
      schema?: any;
    };
  },
  resolve: (result: string, ctx) => {
    return [result, ctx.redisearch] as [
      string,
      {
        DIALECT: number;
        PARAMS: Record<string, any>;
      },
    ];
  },
});
