import { fold, isPlainObject, isProperty } from './utils';
import {
  UnexpectedValueError,
  OperatorNotSupportedError,
  DataDepthError,
} from './errors';
import { CriteriumDialect, CriteruimQuery } from './types';
import * as validation from './validation';

export function converter<T>(dialect: CriteriumDialect<T>) {
  if (!dialect.operators?.$eq || !dialect.operators?.$and) {
    throw new Error('operators "$eq" and "$and" are mandatory');
  }

  return <Data extends Record<string, any>>(query: CriteruimQuery<Data>): T => {
    const operators = dialect.operators;
    const validations = validation.operators;

    return fold<any, T>((children, node, path) => {
      const dataPath = path.filter(isProperty);
      const key = path[path.length - 1];
      const options = { path };

      // root
      if (key === undefined) {
        if (!isPlainObject(node)) {
          throw new UnexpectedValueError(node, path, dataPath);
        }
      
        return operators.$and(dataPath, node, children, options);
      }
      // operators
      else if (key in operators) {
        const err = validations[key](path, node, dataPath);
        if (err) {
          throw err
        }

        if (dialect.dataDepth && dataPath.length > dialect.dataDepth) {
          throw new DataDepthError(node, path, dataPath);
        }

        return operators[key](dataPath, node, children, options);
      }
      // properties
      else if (typeof key === 'string' && !(key in validations)) {
        if (isPlainObject(node)) {
          return operators.$and(dataPath, node, children, options);
        }

        const err = validations.$eq(path, node, dataPath);
        if (err) {
          throw err
        }

        if (dialect.dataDepth && dataPath.length > dialect.dataDepth) {
          throw new DataDepthError(node, path, dataPath);
        }

        return operators.$eq(dataPath, node, children, options);
      }
      // arrays
      else if (typeof key === 'number') {
        if (isPlainObject(node)) {
          return operators.$and(dataPath, node, children, options);
        }
        return node;
      } else {
        throw new OperatorNotSupportedError(node, path, dataPath);
      }
    }, query);
  };
}
