import { SearchOptions } from "redis";

export const paginate = (skip: number | undefined, limit: number | undefined) => {
  return ((index: string, rsQuery: string, ctx: SearchOptions) => {
    ctx.LIMIT = { from: typeof skip === 'undefined'? 0 : skip, size: typeof limit === 'undefined'? 10 : limit };
    return [index, rsQuery, ctx] as [string, string, SearchOptions];
  });
}

