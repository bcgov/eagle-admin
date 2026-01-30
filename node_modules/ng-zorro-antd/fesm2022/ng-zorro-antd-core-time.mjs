import { startOfWeek, startOfMonth, setYear, addYears, setMonth, addMonths, setDay, getQuarter, setQuarter, isSameDay, isSameSecond, isSameMinute, isSameHour, isSameMonth, isSameQuarter, isSameYear, differenceInCalendarDays, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInCalendarMonths, differenceInCalendarQuarters, differenceInCalendarYears, isToday, isValid, isFirstDayOfMonth, isLastDayOfMonth } from 'date-fns';
import { warn } from 'ng-zorro-antd/core/logger';
import { getLocaleDayPeriods, FormStyle, TranslationWidth } from '@angular/common';
import { isNotNil } from 'ng-zorro-antd/core/util';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function wrongSortOrder(rangeValue) {
    const [start, end] = rangeValue;
    return !!start && !!end && end.isBeforeDay(start);
}
function normalizeRangeValue(value, hasTimePicker, type = 'month', activePart = 'left') {
    const [start, end] = value;
    let newStart = start || new CandyDate();
    let newEnd = end || (hasTimePicker ? newStart : newStart.add(1, type));
    if (start && !end) {
        newStart = start;
        newEnd = hasTimePicker ? start : start.add(1, type);
    }
    else if (!start && end) {
        newStart = hasTimePicker ? end : end.add(-1, type);
        newEnd = end;
    }
    else if (start && end && !hasTimePicker) {
        if (start.isSame(end, type)) {
            newEnd = newStart.add(1, type);
        }
        else {
            if (activePart === 'left') {
                newEnd = newStart.add(1, type);
            }
            else {
                newStart = newEnd.add(-1, type);
            }
        }
    }
    return [newStart, newEnd];
}
function cloneDate(value) {
    if (Array.isArray(value)) {
        return value.map(v => (v instanceof CandyDate ? v.clone() : null));
    }
    else {
        return value instanceof CandyDate ? value.clone() : null;
    }
}
/**
 * Wrapping kind APIs for date operating and unify
 * NOTE: every new API return new CandyDate object without side effects to the former Date object
 * NOTE: most APIs are based on local time other than customized locale id (this needs tobe support in future)
 * TODO: support format() against to angular's core API
 */
class CandyDate {
    nativeDate;
    // locale: string; // Custom specified locale ID
    constructor(date) {
        if (date) {
            if (date instanceof Date) {
                this.nativeDate = date;
            }
            else if (typeof date === 'string' || typeof date === 'number') {
                warn('The string type is not recommended for date-picker, use "Date" type');
                this.nativeDate = new Date(date);
            }
            else {
                throw new Error('The input date type is not supported ("Date" is now recommended)');
            }
        }
        else {
            this.nativeDate = new Date();
        }
    }
    calendarStart(options) {
        return new CandyDate(startOfWeek(startOfMonth(this.nativeDate), options));
    }
    // ---------------------------------------------------------------------
    // | Native shortcuts
    // -----------------------------------------------------------------------------\
    getYear() {
        return this.nativeDate.getFullYear();
    }
    getMonth() {
        return this.nativeDate.getMonth();
    }
    getDay() {
        return this.nativeDate.getDay();
    }
    getTime() {
        return this.nativeDate.getTime();
    }
    getDate() {
        return this.nativeDate.getDate();
    }
    getHours() {
        return this.nativeDate.getHours();
    }
    getMinutes() {
        return this.nativeDate.getMinutes();
    }
    getSeconds() {
        return this.nativeDate.getSeconds();
    }
    getMilliseconds() {
        return this.nativeDate.getMilliseconds();
    }
    // ---------------------------------------------------------------------
    // | New implementing APIs
    // ---------------------------------------------------------------------
    clone() {
        return new CandyDate(new Date(this.nativeDate));
    }
    setHms(hour, minute, second) {
        const newDate = new Date(this.nativeDate.setHours(hour, minute, second));
        return new CandyDate(newDate);
    }
    setYear(year) {
        return new CandyDate(setYear(this.nativeDate, year));
    }
    addYears(amount) {
        return new CandyDate(addYears(this.nativeDate, amount));
    }
    // NOTE: month starts from 0
    // NOTE: Don't use the native API for month manipulation as it not restrict the date when it overflows, eg. (new Date('2018-7-31')).setMonth(1) will be date of 2018-3-03 instead of 2018-2-28
    setMonth(month) {
        return new CandyDate(setMonth(this.nativeDate, month));
    }
    addMonths(amount) {
        return new CandyDate(addMonths(this.nativeDate, amount));
    }
    setDay(day, options) {
        return new CandyDate(setDay(this.nativeDate, day, options));
    }
    setDate(amount) {
        const date = new Date(this.nativeDate);
        date.setDate(amount);
        return new CandyDate(date);
    }
    getQuarter() {
        return getQuarter(this.nativeDate);
    }
    setQuarter(quarter) {
        return new CandyDate(setQuarter(this.nativeDate, quarter));
    }
    addDays(amount) {
        return this.setDate(this.getDate() + amount);
    }
    add(amount, mode) {
        switch (mode) {
            case 'decade':
                return this.addYears(amount * 10);
            case 'year':
                return this.addYears(amount);
            case 'month':
                return this.addMonths(amount);
            default:
                return this.addMonths(amount);
        }
    }
    isSame(date, grain = 'day') {
        let fn;
        switch (grain) {
            case 'decade':
                fn = (pre, next) => Math.abs(pre.getFullYear() - next.getFullYear()) < 11;
                break;
            case 'year':
                fn = isSameYear;
                break;
            case 'quarter':
                fn = isSameQuarter;
                break;
            case 'month':
                fn = isSameMonth;
                break;
            case 'day':
                fn = isSameDay;
                break;
            case 'hour':
                fn = isSameHour;
                break;
            case 'minute':
                fn = isSameMinute;
                break;
            case 'second':
                fn = isSameSecond;
                break;
            default:
                fn = isSameDay;
                break;
        }
        return fn(this.nativeDate, this.toNativeDate(date));
    }
    isSameYear(date) {
        return this.isSame(date, 'year');
    }
    isSameQuarter(date) {
        return this.isSame(date, 'quarter');
    }
    isSameMonth(date) {
        return this.isSame(date, 'month');
    }
    isSameDay(date) {
        return this.isSame(date, 'day');
    }
    isSameHour(date) {
        return this.isSame(date, 'hour');
    }
    isSameMinute(date) {
        return this.isSame(date, 'minute');
    }
    isSameSecond(date) {
        return this.isSame(date, 'second');
    }
    isBefore(date, grain = 'day') {
        if (date === null) {
            return false;
        }
        let fn;
        switch (grain) {
            case 'year':
                fn = differenceInCalendarYears;
                break;
            case 'quarter':
                fn = differenceInCalendarQuarters;
                break;
            case 'month':
                fn = differenceInCalendarMonths;
                break;
            case 'day':
                fn = differenceInCalendarDays;
                break;
            case 'hour':
                fn = differenceInHours;
                break;
            case 'minute':
                fn = differenceInMinutes;
                break;
            case 'second':
                fn = differenceInSeconds;
                break;
            default:
                fn = differenceInCalendarDays;
                break;
        }
        return fn(this.nativeDate, this.toNativeDate(date)) < 0;
    }
    isBeforeYear(date) {
        return this.isBefore(date, 'year');
    }
    isBeforeQuarter(date) {
        return this.isBefore(date, 'quarter');
    }
    isBeforeMonth(date) {
        return this.isBefore(date, 'month');
    }
    isBeforeDay(date) {
        return this.isBefore(date, 'day');
    }
    // Equal to today accurate to "day"
    isToday() {
        return isToday(this.nativeDate);
    }
    isValid() {
        return isValid(this.nativeDate);
    }
    isFirstDayOfMonth() {
        return isFirstDayOfMonth(this.nativeDate);
    }
    isLastDayOfMonth() {
        return isLastDayOfMonth(this.nativeDate);
    }
    toNativeDate(date) {
        return date instanceof CandyDate ? date.nativeDate : date;
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const timeUnits = [
    ['Y', 1000 * 60 * 60 * 24 * 365], // years
    ['M', 1000 * 60 * 60 * 24 * 30], // months
    ['D', 1000 * 60 * 60 * 24], // days
    ['H', 1000 * 60 * 60], // hours
    ['m', 1000 * 60], // minutes
    ['s', 1000], // seconds
    ['S', 1] // million seconds
];

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// from https://github.com/hsuanxyz/ng-time-parser
class NgTimeParser {
    format;
    localeId;
    regex = null;
    matchMap = {
        hour: null,
        minute: null,
        second: null,
        periodNarrow: null,
        periodWide: null,
        periodAbbreviated: null
    };
    constructor(format, localeId) {
        this.format = format;
        this.localeId = localeId;
        this.genRegexp();
    }
    toDate(str) {
        const result = this.getTimeResult(str);
        const time = new Date();
        if (isNotNil(result?.hour)) {
            time.setHours(result.hour);
        }
        if (isNotNil(result?.minute)) {
            time.setMinutes(result.minute);
        }
        if (isNotNil(result?.second)) {
            time.setSeconds(result.second);
        }
        if (result?.period === 1 && time.getHours() < 12) {
            time.setHours(time.getHours() + 12);
        }
        return time;
    }
    getTimeResult(str) {
        const match = this.regex.exec(str);
        let period = null;
        if (match) {
            if (isNotNil(this.matchMap.periodNarrow)) {
                period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Narrow).indexOf(match[this.matchMap.periodNarrow + 1]);
            }
            if (isNotNil(this.matchMap.periodWide)) {
                period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Wide).indexOf(match[this.matchMap.periodWide + 1]);
            }
            if (isNotNil(this.matchMap.periodAbbreviated)) {
                period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Abbreviated).indexOf(match[this.matchMap.periodAbbreviated + 1]);
            }
            return {
                hour: isNotNil(this.matchMap.hour) ? Number.parseInt(match[this.matchMap.hour + 1], 10) : null,
                minute: isNotNil(this.matchMap.minute) ? Number.parseInt(match[this.matchMap.minute + 1], 10) : null,
                second: isNotNil(this.matchMap.second) ? Number.parseInt(match[this.matchMap.second + 1], 10) : null,
                period
            };
        }
        else {
            return null;
        }
    }
    genRegexp() {
        let regexStr = this.format.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$&');
        const hourRegex = /h{1,2}/i;
        const minuteRegex = /m{1,2}/;
        const secondRegex = /s{1,2}/;
        const periodNarrow = /aaaaa/;
        const periodWide = /aaaa/;
        const periodAbbreviated = /a{1,3}/;
        const hourMatch = hourRegex.exec(this.format);
        const minuteMatch = minuteRegex.exec(this.format);
        const secondMatch = secondRegex.exec(this.format);
        const periodNarrowMatch = periodNarrow.exec(this.format);
        let periodWideMatch = null;
        let periodAbbreviatedMatch = null;
        if (!periodNarrowMatch) {
            periodWideMatch = periodWide.exec(this.format);
        }
        if (!periodWideMatch && !periodNarrowMatch) {
            periodAbbreviatedMatch = periodAbbreviated.exec(this.format);
        }
        const matchs = [hourMatch, minuteMatch, secondMatch, periodNarrowMatch, periodWideMatch, periodAbbreviatedMatch]
            .filter(m => !!m)
            .sort((a, b) => a.index - b.index);
        matchs.forEach((match, index) => {
            switch (match) {
                case hourMatch:
                    this.matchMap.hour = index;
                    regexStr = regexStr.replace(hourRegex, '(\\d{1,2})');
                    break;
                case minuteMatch:
                    this.matchMap.minute = index;
                    regexStr = regexStr.replace(minuteRegex, '(\\d{1,2})');
                    break;
                case secondMatch:
                    this.matchMap.second = index;
                    regexStr = regexStr.replace(secondRegex, '(\\d{1,2})');
                    break;
                case periodNarrowMatch: {
                    this.matchMap.periodNarrow = index;
                    const periodsNarrow = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Narrow).join('|');
                    regexStr = regexStr.replace(periodNarrow, `(${periodsNarrow})`);
                    break;
                }
                case periodWideMatch: {
                    this.matchMap.periodWide = index;
                    const periodsWide = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Wide).join('|');
                    regexStr = regexStr.replace(periodWide, `(${periodsWide})`);
                    break;
                }
                case periodAbbreviatedMatch: {
                    this.matchMap.periodAbbreviated = index;
                    const periodsAbbreviated = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Abbreviated).join('|');
                    regexStr = regexStr.replace(periodAbbreviated, `(${periodsAbbreviated})`);
                    break;
                }
            }
        });
        this.regex = new RegExp(regexStr);
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CandyDate, cloneDate, normalizeRangeValue, timeUnits, wrongSortOrder, NgTimeParser as ɵNgTimeParser };
//# sourceMappingURL=ng-zorro-antd-core-time.mjs.map
