import { describe, test } from 'node:test'
import { expect } from 'expect';

import { z } from 'zod';
import { queryOf } from './index';

describe('queryOf', () => {
  test('works', () => {
    const schema = queryOf(
      z.object({
        name: z.string(),
        addresse: z.object({
          street: z.string(),
        }),
      }),
    );

    const data = { addresse: { street: { $in: ['SF', 'NY'] } } };

    expect(schema.safeParse(data)).toEqual({
      success: true,
      data,
    });

    const errResult = schema.safeParse({
      addresse: { streeet: { $in: ['SF', 'NY'] } },
    }) as z.SafeParseError<any>;

    expect(errResult.success).toEqual(false);

    expect(errResult.error.errors[0].message).toEqual(
      "Unrecognized key(s) in object: 'streeet'",
    );
  });
});
