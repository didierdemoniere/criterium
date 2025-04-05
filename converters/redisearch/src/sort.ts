import { CriteruimSortQuery } from "@criterium/core"
import { SearchOptions } from "redis";

export const sort = <Data extends Record<string, any>>(sorts: CriteruimSortQuery<Data>) => {
  return ((index: string, rsQuery: string, ctx: SearchOptions) => {
    const order = Object.entries(sorts)[0];

    ctx.SORTBY = {
      BY: order[0],
      DIRECTION: order[1] === -1 ? 'DESC' :'ASC'
    };

    return [index, rsQuery, ctx] as [string, string, SearchOptions];
  });
}

