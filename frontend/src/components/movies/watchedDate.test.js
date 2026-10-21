import { parseWatchedDate, toDateInput, tidyDateInput } from './watchedDate';

const thisYear = new Date().getFullYear();

describe('parseWatchedDate', () => {
  it.each([
    ['', null],
    ['   ', null],
    [null, null],
    ['Invalid date', null],
    ['14/10', `${thisYear}-10-14`],
    ['5/3', `${thisYear}-03-05`],
    ['05/10/2026', '2026-10-05'],
    ['14/10/2026', '2026-10-14'],
    ['29/02/2024', '2024-02-29'],
    ['2025-06-03', '2025-06-03'],
  ])('accepts %p as %p', (input, iso) => {
    expect(parseWatchedDate(input)).toEqual({ valid: true, iso });
  });

  it.each(['32/01', '14/13', '29/02/2023', '00/05', '14/10/26', '14-10-2026', 'yesterday'])(
    'rejects %p',
    (input) => {
      expect(parseWatchedDate(input)).toEqual({ valid: false });
    }
  );
});

describe('display helpers', () => {
  it('shows stored dates as DD/MM/YYYY and empties blanks', () => {
    expect(toDateInput('2026-10-05')).toBe('05/10/2026');
    expect(toDateInput(null)).toBe('');
    expect(toDateInput('Invalid date')).toBe('');
  });

  it('expands valid input on blur and leaves invalid input alone', () => {
    expect(tidyDateInput('5/3/2020')).toBe('05/03/2020');
    expect(tidyDateInput('14/13')).toBe('14/13');
  });
});
