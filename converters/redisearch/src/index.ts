import { converter, utils, type CriteruimQuery } from '@criterium/core';

const Datatypes = {
  TEXT: 'TEXT',
  NUMERIC: 'NUMERIC',
  TAG: 'TAG',
};

type Ctx = {
  DIALECT: number;
  PARAMS: Record<string, any>;
};

/**
 * redisSearch only allows alphanumeric characters and underscores
 * @see: https://redis.io/docs/stack/search/reference/escaping/
 */
const escape = utils.escape(/[^\w\d_]/);

const placeholder = (ctx: Ctx, prop: string, val) => {
  ctx.PARAMS[prop] = val;
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


export const compile = converter<(ctx: Ctx) => string>({
  dataDepth: 1,
  operators: {
    $and: (_, __, children) => (ctx) => children.map(child => child(ctx)).filter(Boolean).join(' '),
    $or: (_, __, children) => (ctx) =>`(${children.map(child => child(ctx)).filter(Boolean).join('|')})`,
    $nor: (_, __, children) => (ctx) =>`-(${children.map(child => child(ctx)).filter(Boolean).join('|')})`,
    $not: (_, __, children) => (ctx) =>`-(${children.map(child => child(ctx)).filter(Boolean).join(' ')})`,
    $in: ([prop], __, children: Array<any>) => {
      return (ctx) => {
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
      }
    },
    // $all: ([prop], __, children: any[]) => {
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
    $nin: ([prop], __, children: Array<any>) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variables = children.map((value, i) =>
          placeholder(ctx, escapedProp + i, coerce(value))
        );

        return `-(${variables
          .map((variable, i) => {
            const type = getType(children[i]);
            return `@${escapedProp}:${formatVariable(variable, type)}`;
          })
          .join('|')})`;
      }
    },
    $gt: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = placeholder(ctx, escapedProp, Number(value));
        return `@${escapedProp}:[(${variable} +inf]`;
      }
    },
    $gte: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = placeholder(ctx, escapedProp, Number(value));
        return `@${escapedProp}:[${variable} +inf]`;
      }
    },
    $lt: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = placeholder(ctx, escapedProp, Number(value));
        return `@${escapedProp}:[-inf (${variable}]`;
      }
    },
    $lte: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = placeholder(ctx, escapedProp, Number(value));
        return `@${escapedProp}:[-inf ${variable}]`;
      }
    },
    $ne: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const type = getType(value);
        const variable = placeholder(ctx, escapedProp, coerce(value));
        return `-@${escapedProp}:${formatVariable(variable, type)}`;
      }
    },
    $eq: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const type = getType(value);
        const variable = placeholder(ctx, escapedProp, coerce(value));
        return `@${escapedProp}:${formatVariable(variable, type)}`;
      }
    },
    $like: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = placeholder(ctx, escapedProp, coerce(value));
        return `@${escapedProp}:*${variable}*`;
      }
    },
  },
});


export default <T extends Record<string, any>>(query: CriteruimQuery<T>, options?: Partial<Ctx>) => {
  const ctx = {
    DIALECT: 2,
    PARAMS: {},
    ...(options || {})
  };

  return [
    compile(query)(ctx) as string || '*', 
    Object.keys(ctx.PARAMS).length > 0 ? ctx : { DIALECT: ctx.DIALECT }
  ] as const;
}