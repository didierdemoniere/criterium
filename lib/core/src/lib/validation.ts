import { QueryValidationError } from './errors';
import { isPlainObject, isRegExp } from './utils';

export const operators = {
  $and: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : false,
  $or: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : false,
  $nor: (path, value, dataPath) =>
    !Array.isArray(value) || value.some((val) => !isPlainObject(val))
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : false,
  $not: (path, value, dataPath) =>
    !isPlainObject(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $in: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $all: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $nin: (path, value, dataPath) =>
    !Array.isArray(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $gt: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $gte: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $lt: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $lte: (path, value, dataPath) =>
    typeof value == 'boolean' || isNaN(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $ne: (path, value, dataPath) =>
    Array.isArray(value) || isPlainObject(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $eq: (path, value, dataPath) =>
    Array.isArray(value) || isPlainObject(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $like: (path, value, dataPath) =>
    typeof value !== 'string' && !isRegExp(value)
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
  $exists: (path, value, dataPath) =>
    typeof value !== 'boolean'
      ? new QueryValidationError('UnexpectedValue',value, path, dataPath)
      : dataPath.length === 0
      ? new QueryValidationError('PropertyNotFound',value, path, dataPath)
      : false,
};
