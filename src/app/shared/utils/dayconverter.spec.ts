import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from './utils';

describe('DayConverter Utils', () => {
  it('turns a JS date into the NGB date with a 1-based month', () => {
    expect(convertJSDateToNGBDate(new Date(2010, 6, 14))).toEqual({ year: 2010, month: 7, day: 14 });
  });

  it('turns an NGB date into the local midnight JS date', () => {
    expect(convertFormGroupNGBDateToJSDate({ year: 2010, month: 7, day: 14 })).toEqual(new Date(2010, 6, 14));
  });

  it('turns the last NGB date of a year into Dec 31', () => {
    expect(convertFormGroupNGBDateToJSDate({ year: 2019, month: 12, day: 31 })).toEqual(new Date(2019, 11, 31));
  });

  it('turns a Dec 31 JS date into month 12', () => {
    expect(convertJSDateToNGBDate(new Date(2019, 11, 31))).toEqual({ year: 2019, month: 12, day: 31 });
  });

  it('turns a Jan 1 JS date into month 1 of the new year', () => {
    expect(convertJSDateToNGBDate(new Date(2020, 0, 1))).toEqual({ year: 2020, month: 1, day: 1 });
  });

  it('turns the first NGB date of a year into Jan 1', () => {
    expect(convertFormGroupNGBDateToJSDate({ year: 2020, month: 1, day: 1 })).toEqual(new Date(2020, 0, 1));
  });

  it('drops the time of day when turning a JS date into an NGB date', () => {
    expect(convertJSDateToNGBDate(new Date(2016, 6, 27, 13, 30, 0))).toEqual({ year: 2016, month: 7, day: 27 });
  });
});
