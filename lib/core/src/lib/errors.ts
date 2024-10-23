export class ConfigurationError extends Error {
  public name: 'ConfigurationError' = 'ConfigurationError';
}

export class QueryValidationError extends Error {
  public name: 'QueryValidationError' = 'QueryValidationError';
  constructor(
    public code: 'UnexpectedValue' | 'PropertyNotFound' | 'OperatorNotSupported' | 'SchemaValidation' | 'MaxDataDepth',
    public value: any,
    public path: Array<string | number>,
    public dataPath: Array<string | number>,
  ) {
    super(
      code === 'UnexpectedValue' ?
        path.length > 0
          ? `unexpected value for operator ${path[path.length - 1]} at '${[
              '$',
              ...path,
            ].join('.')}'`
          : `unexpected value for query at '$'`
      : 
      code === 'PropertyNotFound' ?
        `property not found for operator ${path[path.length - 1]} at '${[
          '$',
          ...path,
        ].join('.')}'`
      :
      code === 'OperatorNotSupported' ?
        `'${path[path.length - 1]}' operator not supported at '${[
        '$',
        ...path,
        ].join('.')}'`
      :
      code === 'SchemaValidation' ?
        `querying path '${['$', ...dataPath].join('.')}' is not allowed at '${[
        '$',
        ...path,
        ].join('.')}'`
      :
      code === 'MaxDataDepth' ?
        `max depth exceeded for path '${['$', ...dataPath].join('.')}' at '${[
        '$',
        ...path,
        ].join('.')}'`
      :
      `Unexpected error code: ${code}`
    );
    
    this.code = code;
  }
}
