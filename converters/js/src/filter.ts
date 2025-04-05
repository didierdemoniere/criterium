import { ConfigurationError, converter, utils, QueryValidationError, CriteruimFilterQuery } from '@criterium/core';
import { converterOptions } from "./options";

const options = converterOptions.predicate;

const coerce = (val: any) => {
  return typeof val !== 'boolean' && !isNaN(val) ? Number(val) : val;
};

const createPredicate = converter<(item) => boolean>({
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
        children.filter(Boolean).every((child) => !child(item));
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

if (createPredicate instanceof ConfigurationError) {
  throw createPredicate;
}

export const filter = <Data extends Record<string, any>>(query: CriteruimFilterQuery<Data>) => {
  const predicate = createPredicate(query);
  if (predicate instanceof QueryValidationError) {
    return predicate;
  }
  return (arr: Array<Data>) => arr.filter(predicate);
}
