import { PropertyNotFoundError, UnexpectedValueError } from './errors';
import { isPlainObject, isRegExp } from './utils';

export const operators = {
  $and: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new UnexpectedValueError(value, path, dataPath)
      : false,
  $or: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new UnexpectedValueError(value, path, dataPath)
      : false,
  $nor: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new UnexpectedValueError(value, path, dataPath)
      : false,
  $not: (path, value, dataPath) =>
    !isPlainObject(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $in: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $all: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $nin: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $gt: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $gte: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $lt: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $lte: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $ne: (path, value, dataPath) =>
    Array.isArray(value) || isPlainObject(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $eq: (path, value, dataPath) =>
    Array.isArray(value) || isPlainObject(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $like: (path, value, dataPath) =>
    typeof value !== 'string' && !isRegExp(value)
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
  $exists: (path, value, dataPath) =>
    typeof value !== 'boolean'
      ? new UnexpectedValueError(value, path, dataPath)
      : dataPath.length === 0
      ? new PropertyNotFoundError(value, path, dataPath)
      : false,
};
