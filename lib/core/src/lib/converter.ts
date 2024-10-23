import { fold, isPlainObject, isProperty } from './utils';
import {
  QueryValidationError,
  ConfigurationError,
} from './errors';
import { CriteriumDialect, CriteruimQuery } from './types';
import * as validation from './validation';

export function converter<T>(dialect: CriteriumDialect<T>) {
  if (!dialect.operators?.$eq || !dialect.operators?.$and) {
    return new ConfigurationError('operators "$eq" and "$and" are mandatory');
  }

  return <Data extends Record<string, any>>(query: CriteruimQuery<Data>): 
  T | QueryValidationError => {
    const operators = dialect.operators;
    const validations = validation.operators;

    try {
      return fold<any, T>((children, node, path) => {
        const dataPath = path.filter(isProperty);
        const key = path[path.length - 1];
        const options = { path };
  
        // root
        if (key === undefined) {
          if (!isPlainObject(node)) {
            throw new QueryValidationError('UnexpectedValue', node, path, dataPath);
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
            throw new QueryValidationError('MaxDataDepth',node, path, dataPath);
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
            throw new QueryValidationError('MaxDataDepth',node, path, dataPath);
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
          throw new QueryValidationError('OperatorNotSupported', node, path, dataPath);
        }
      }, query);
    } catch (e) {
      return e as QueryValidationError
    }
  };
}
