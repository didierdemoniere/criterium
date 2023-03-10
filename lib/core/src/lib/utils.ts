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
