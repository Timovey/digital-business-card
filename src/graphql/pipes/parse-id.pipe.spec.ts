import { BadInputError } from '../../common/errors/domain.error';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it('parses positive integer ids', () => {
    expect(pipe.transform('1')).toBe(1);
    expect(pipe.transform('2147483647')).toBe(2_147_483_647);
  });

  it('passes an omitted optional argument through as null', () => {
    expect(pipe.transform(undefined)).toBeNull();
    expect(pipe.transform(null)).toBeNull();
  });

  it.each(['abc', '', '0', '-1', '01', '1.5', ' 1', '1e3', '2147483648', '99999999999'])(
    'rejects %p as bad user input',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(BadInputError);
    },
  );
});
