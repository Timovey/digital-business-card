import { Kind } from 'graphql';
import { LocalDateScalar } from './local-date.scalar';

describe('LocalDateScalar', () => {
  it('serializes a Date to YYYY-MM-DD', () => {
    expect(LocalDateScalar.serialize(new Date('2025-03-01T00:00:00Z'))).toBe('2025-03-01');
  });

  it('parses valid dates from variables and literals', () => {
    expect(LocalDateScalar.parseValue('2025-03-01')).toEqual(new Date('2025-03-01T00:00:00Z'));
    expect(LocalDateScalar.parseLiteral({ kind: Kind.STRING, value: '2025-03-01' })).toEqual(
      new Date('2025-03-01T00:00:00Z'),
    );
  });

  it.each(['2025-3-1', '2025-13-01', '2025-02-30', 'yesterday'])('rejects "%s"', (value) => {
    expect(() => LocalDateScalar.parseValue(value)).toThrow('YYYY-MM-DD');
  });
});
