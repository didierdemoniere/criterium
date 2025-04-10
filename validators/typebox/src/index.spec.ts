import { describe, test } from 'node:test'
import { expect } from 'expect';

import { Static, Type as t } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { queryOf } from './index';


describe('queryOf', () => {
  test('works', () => {
    const schema = queryOf(t, t.Object({
      name: t.String(),
      addresse: t.Object({
        street: t.String(),
      }),
    }));

    expect(Value.Errors(schema, {
      addresse: { street: { $in: ['SF', 'NY'] } },
    } as Static<typeof schema>).First()).toEqual(undefined);

    const err = Value.Errors(schema, {
      addresse: { streeet: { $in: ['SF', 'NY'] } },
    }).First();

    expect(err?.path).toEqual("/addresse/streeet")
    expect(err?.value).toEqual({ $in: ["SF", "NY"] })
    expect(err?.message).toEqual("Unexpected property")

  });
});
