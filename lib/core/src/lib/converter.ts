import { fold } from 'langkit';
import { isPlainObject, isProperty } from './utils';
import {
  UnexpectedValueError,
  OperatorNotSupportedError,
  DataDepthError,
} from './errors';
import { CriteriumContext, CriteriumDialect } from './types';
import * as validation from './validation';

export function converter<
  T,
  R = T,
  XCTX extends { schema?: any } = { schema?: any },
>(dialect: CriteriumDialect<T, R, XCTX>) {
  if (!dialect.operators?.$eq || !dialect.operators?.$and) {
    throw new Error('operators "$eq" and "$and" are mandatory');
  }

  return (query: Record<string, any>, xctx: Partial<XCTX> = {} as XCTX): R => {
    const ctx: CriteriumContext<XCTX> = {
      errors: [],
      ...(dialect.extendCtx ? dialect.extendCtx() : {}),
      ...xctx,
    } as any;

    const operators = dialect.operators;
    const validations = validation.operators;

    const result = fold<any, T>((children, node, path) => {
      const dataPath = path.filter(isProperty);
      const key = path[path.length - 1];
      const options = { path, ctx };

      // root
      if (key === undefined) {
        if (!isPlainObject(node)) {
          ctx.errors.push(new UnexpectedValueError(node, path, dataPath));
        }
        if (ctx.errors.length > 0) {
          throw dialect.reject
            ? dialect.reject(ctx.errors.reverse(), ctx)
            : new Error(ctx.errors.reverse().join('\n'));
        }
        const result = operators.$and(dataPath, node, children, options);
        return result;
      }
      // operators
      else if (key in operators) {
        const err = validations[key](path, node, dataPath);
        if (err) {
          ctx.errors.push(err);
        }

        if (dialect.dataDepth && dataPath.length > dialect.dataDepth) {
          ctx.errors.push(new DataDepthError(node, path, dataPath));
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
          ctx.errors.push(err);
        }

        if (dialect.dataDepth && dataPath.length > dialect.dataDepth) {
          ctx.errors.push(new DataDepthError(node, path, dataPath));
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
        ctx.errors.push(new OperatorNotSupportedError(node, path, dataPath));
      }
    }, query);

    return dialect.resolve ? dialect.resolve(result, ctx) : (result as any);
  };
}
