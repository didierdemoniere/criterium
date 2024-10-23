import { ConfigurationError, converter, CriteruimQuery, utils, QueryValidationError } from '@criterium/core';

export const converterOptions = {
  predicate: {
    get: (obj: any, path: Array<string | number>) => {
      return path.reduce((current, key) => current && current[key], obj);
    },
  },
};

const options = converterOptions.predicate;

const coerce = (val: any) => {
  return typeof val !== 'boolean' && !isNaN(val) ? Number(val) : val;
};

const compile = converter<(item) => boolean>({
  operators: {
    $and: (_, __, children) => {
      return (item) =>
        children.filter(Boolean).every((child) => child(item));
    },
    $or: (_, __, children) => {
      return (item) =>
        children.filter(Boolean).some((child) => child(item));
    },
    $nor: (_, __, children) => {
      return (item) =>
        !children.filter(Boolean).every((child) => child(item));
    },
    $not: (_, __, children) => {
      return (item) =>
        !children.filter(Boolean).every((child) => child(item));
    },
    $all: (dataPath, values: any[]) => {
      return (item) => {
        const nestedValues: any[] = Array.from(
          options.get(item, dataPath),
          coerce,
        );
        return values.every((value) => nestedValues.includes(coerce(value)));
      };
    },
    $in: (dataPath, values: any[]) => {
      return (item) => {
        const nestedValue = coerce(options.get(item, dataPath));
        return values.some((value) => coerce(value) === nestedValue);
      };
    },
    $nin: (dataPath, values: any[]) => {
      return (item) => {
        const nestedValue = coerce(options.get(item, dataPath));
        return !values.some((value) => coerce(value) === nestedValue);
      };
    },
    $gt: (dataPath, value) => {
      return (item) => Number(options.get(item, dataPath)) > Number(value);
    },
    $gte: (dataPath, value) => {
      return (item) =>
        Number(options.get(item, dataPath)) >= Number(value);
    },
    $lt: (dataPath, value) => {
      return (item) => Number(options.get(item, dataPath)) < Number(value);
    },
    $lte: (dataPath, value) => {
      return (item) =>
        Number(options.get(item, dataPath)) <= Number(value);
    },
    $ne: (dataPath, value) => {
      return (item) =>
        coerce(options.get(item, dataPath)) !== coerce(value);
    },
    $eq: (dataPath, value) => {
      return (item) =>
        coerce(options.get(item, dataPath)) === coerce(value);
    },
    $like: (dataPath, value) => {
      return (item) =>
        (utils.isRegExp(value) ? value : new RegExp(value)).test(
          options.get(item, dataPath),
        );
    },
    $exists: (dataPath, value) => {
      return (item) => {
        const nestedValue = options.get(item, dataPath);
        return value
          ? nestedValue !== undefined && nestedValue !== null
          : nestedValue === undefined || nestedValue === null;
      };
    },
  },
});

if (compile instanceof ConfigurationError) {
  throw compile;
}

export default compile as <Data extends Record<string, any>>(query: CriteruimQuery<Data>) => ((item: any) => boolean) | QueryValidationError;