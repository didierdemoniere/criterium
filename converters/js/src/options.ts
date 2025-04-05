export const converterOptions = {
  predicate: {
    get: (obj: any, path: Array<string | number>) => {
      return path.reduce((current, key) => current && current[key], obj);
    },
  },
};