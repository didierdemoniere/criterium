export class UnexpectedValueError extends Error {
  constructor(
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      path.length > 0
        ? `unexpected value for operator ${path[path.length - 1]} at '${[
            '$',
            ...path,
          ].join('.')}'`
        : `unexpected value for query at '$'`,
    );
    this.name = 'UnexpectedValueError';
  }
}

export class PropertyNotFoundError extends Error {
  constructor(
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      `property not found for operator ${path[path.length - 1]} at '${[
        '$',
        ...path,
      ].join('.')}'`,
    );
    this.name = 'PropertyNotFoundError';
  }
}

export class OperatorNotSupportedError extends Error {
  constructor(
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      `'${path[path.length - 1]}' operator not supported at '${[
        '$',
        ...path,
      ].join('.')}'`,
    );
    this.name = 'OperatorNotSupportedError';
  }
}

export class SchemaValidationError extends Error {
  constructor(
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      `querying path '${['$', ...dataPath].join('.')}' is not allowed at '${[
        '$',
        ...path,
      ].join('.')}'`,
    );
    this.name = 'SchemaValidationError';
  }
}

export class DataDepthError extends Error {
  constructor(
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      `max depth exceeded for path '${['$', ...dataPath].join('.')}' at '${[
        '$',
        ...path,
      ].join('.')}'`,
    );
    this.name = 'DataDepthError';
  }
}
