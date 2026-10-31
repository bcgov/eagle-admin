import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from './utils';

describe('DayConverter Utils', () => {
  it('turns a JS date into the NGB date with a 1-based month', () => {
    expect(convertJSDateToNGBDate(new Date(2010, 6, 14))).toEqual({ year: 2010, month: 7, day: 14 });
  });

  it('turns an NGB date into the local midnight JS date', () => {
    expect(convertFormGroupNGBDateToJSDate({ year: 2010, month: 7, day: 14 })).toEqual(new Date(2010, 6, 14));
  });

  it('drops the time of day when turning a JS date into an NGB date', () => {
    expect(convertJSDateToNGBDate(new Date(2016, 6, 27, 13, 30, 0))).toEqual({ year: 2016, month: 7, day: 27 });
  });
});
