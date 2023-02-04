import { converter, utils } from '@criterium/core';

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

export default converter({
  operators: {
    $and: (_, __, children: Array<(item: any) => boolean>) => {
      return (item: any) =>
        children.filter(Boolean).every((child) => child(item));
    },
    $or: (_, __, children: Array<(item: any) => boolean>) => {
      return (item: any) =>
        children.filter(Boolean).some((child) => child(item));
    },
    $nor: (_, __, children: Array<(item: any) => boolean>) => {
      return (item: any) =>
        !children.filter(Boolean).every((child) => child(item));
    },
    $not: (_, __, children: Array<(item: any) => boolean>) => {
      return (item: any) =>
        !children.filter(Boolean).every((child) => child(item));
    },
    $all: (dataPath, values: any[]) => {
      return (item: any) => {
        const nestedValues: any[] = Array.from(
          options.get(item, dataPath),
          coerce,
        );
        return values.every((value) => nestedValues.includes(coerce(value)));
      };
    },
    $in: (dataPath, values: any[]) => {
      return (item: any) => {
        const nestedValue = coerce(options.get(item, dataPath));
        return values.some((value) => coerce(value) === nestedValue);
      };
    },
    $nin: (dataPath, values: any[]) => {
      return (item: any) => {
        const nestedValue = coerce(options.get(item, dataPath));
        return !values.some((value) => coerce(value) === nestedValue);
      };
    },
    $gt: (dataPath, value) => {
      return (item: any) => Number(options.get(item, dataPath)) > Number(value);
    },
    $gte: (dataPath, value) => {
      return (item: any) =>
        Number(options.get(item, dataPath)) >= Number(value);
    },
    $lt: (dataPath, value) => {
      return (item: any) => Number(options.get(item, dataPath)) < Number(value);
    },
    $lte: (dataPath, value) => {
      return (item: any) =>
        Number(options.get(item, dataPath)) <= Number(value);
    },
    $ne: (dataPath, value) => {
      return (item: any) =>
        coerce(options.get(item, dataPath)) !== coerce(value);
    },
    $eq: (dataPath, value) => {
      return (item: any) =>
        coerce(options.get(item, dataPath)) === coerce(value);
    },
    $like: (dataPath, value) => {
      return (item: any) =>
        (utils.isRegExp(value) ? value : new RegExp(value)).test(
          options.get(item, dataPath),
        );
    },
    $exists: (dataPath, value) => {
      return (item: any) => {
        const nestedValue = options.get(item, dataPath);
        return value
          ? nestedValue !== undefined && nestedValue !== null
          : nestedValue === undefined || nestedValue === null;
      };
    },
  },
});
