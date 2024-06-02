import { operators } from './validation';

const toString = Object.prototype.toString;

/**
 * checks if the value is of the given type
 * @param type
 * @param value
 * @returns true if the value is of the given type
 */
export function typeIs(type: string): (value: any) => boolean;
export function typeIs(type: string, value: any): boolean;
export function typeIs(type: string, value?: any) {
  const typeString = `[object ${type}]`;
  const checker = (value) => toString.call(value) === typeString;
  return arguments.length === 1 ? checker : checker(value);
}

/**
 * checks if the value is a plain object
 * @param value
 * @returns true if the value is a plain object
 */
export const isPlainObject = typeIs('Object') as (
  value?: any,
) => value is object;

/**
 * checks if the value is a RegExp
 * @param value
 * @returns true if the value is a RegExp
 */
export const isRegExp = typeIs('RegExp');

const logicalArrayOperators = ['$and', '$or', '$nor'];

/**
 * @param path
 * @param idx
 * @returns true if the key is a property
 */
export function isProperty(
  key: string | number,
  idx: number,
  path: Array<string | number>,
) {
  return (
    (typeof key === 'string' && !(key in operators)) ||
    (typeof key === 'number' &&
      !logicalArrayOperators.includes(path[idx - 1] as string))
  );
}

/**
 * safe escape a list of characters in a string
 * @param charset
 * @returns a function that takes a string and escapes the characters
 */
export function escape(charset: RegExp) {
  return (str: string) =>
    str.replace(new RegExp(`(?:\\\\{1})*(${charset.source})`, 'g'), `\\$1`);
}

export type Reducer<T, R> = (
  children: Array<R>,
  value: T,
  path: Array<string | number>,
  parent?: T,
) => R | undefined;

/**
 * recursively folds over an ast
 * @param reducer
 * @param ast
 * @param path
 * @param parent
 * @returns
 */
export function fold<T, R>(
  reducer: Reducer<T, R>,
  ast: T,
  path: Array<string | number> = [],
  parent?: T,
): R {
  return reducer(
    (Array.isArray(ast)
      ? ast.map((child, i) => fold(reducer, child, path.concat([i]), ast))
      : isPlainObject(ast)
      ? Object.keys(ast).map((key) =>
          fold(reducer, (ast as any)[key], path.concat([key]), ast),
        )
      : []
    ).filter((child) => child !== undefined),
    ast,
    path,
    parent,
  ) as R;
}
