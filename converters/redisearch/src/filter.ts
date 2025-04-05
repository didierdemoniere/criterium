import { ConfigurationError, converter, CriteruimFilterQuery, QueryValidationError, utils } from '@criterium/core';
import { SearchOptions } from 'redis';

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

const placeholder = (ctx: SearchOptions, prop: string, val) => {
  if (typeof ctx.PARAMS === 'undefined') {
    ctx.PARAMS = {};
  }

  if (getType(val) === Datatypes.TEXT) {
    return val.split(' ').map((part, id) => {
      if (part) {
        ctx.PARAMS![`${prop}${id}`] = part;
        return `$${prop}${id}`
      }
    }).join(' ')
  } 

  ctx.PARAMS[prop] = val;
  return `$${prop}`;
};

const coerce = (val: any) => {
  return typeof val !== 'boolean' && !isNaN(val) ? Number(val) : `${val}`;
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
    : `"${variable}"`;
};

export const compile = converter<(ctx: SearchOptions) => string>({
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
    $all: ([prop], __, children: Array<any>) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variables = children.map((value, id) =>
          placeholder(ctx, escapedProp + id, coerce(value))
        );

        return variables
          .map((variable) => `@${escapedProp}:{${variable}}`)
          .join(' ');
      }
    },
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
        ctx.PARAMS
        const escapedProp = escape(prop.toString());
        const type = getType(value);
        const variable = placeholder(ctx, escapedProp, coerce(value));
        return `@${escapedProp}:${formatVariable(variable, type)}`;
      }
    },
    $like: ([prop], value) => {
      return (ctx) => {
        const escapedProp = escape(prop.toString());
        const variable = value.split('*').map((part, id) => {
          if (!part) return
          return placeholder(ctx, `${escapedProp}${id}`, coerce(part)).trim();
        }).join('*');
        return `@${escapedProp}:${variable}`;
      }
    },
  },
});


if (compile instanceof ConfigurationError) {
  throw compile;
}

export default <T extends Record<string, any>>(query: CriteruimFilterQuery<T>) => {
  const run = compile(query);
  if (run instanceof QueryValidationError) {
    return run
  }

  return (index: string, rsQuery: string, ctx: SearchOptions) => {
    return [
      index, 
      [rsQuery, run(ctx)].join(' ').trim() as string, 
      ctx
    ] as [string, string, SearchOptions];
  }
}