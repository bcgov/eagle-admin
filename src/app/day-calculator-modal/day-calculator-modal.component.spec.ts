import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Utils } from 'src/app/shared/utils/utils';
import { waitForAsync } from '@angular/core/testing';
import { DayCalculatorResult } from './day-calculator-modal.component';
import { DayCalculatorModalComponent } from './day-calculator-modal.component';

describe('DayCalculatorModalComponent', () => {
  let component: DayCalculatorModalComponent;
  let calculated: DayCalculatorResult;

  // calculator inputs
  let regular = true;
  let suspended = false;
  let numDays = 0;
  let startDate = null;
  let endDate = null;
  let suspendDate = null;
  let resumeDate = null;

  beforeEach(waitForAsync(() => {

    component = new DayCalculatorModalComponent(new NgbActiveModal, new Utils);

    // Reset output
    calculated = new DayCalculatorResult();

    // Reset inputs
    regular = true;
    suspended = false;
    numDays = 0;
    startDate = null;
    endDate = null;
    suspendDate = null;
    resumeDate = null;
  }));

  it('TEST 1: tests the 10 day calendar difference using the calendar calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 6, 'day': 1 };
    expected.endDate = { 'year': 2019, 'month': 6, 'day': 10 };
    expected.numDays = 10;

    numDays = 0;

    calculated = component.calculateStartDate(regular, suspended, numDays, expected.startDate, expected.endDate, suspendDate, resumeDate);

    expect(calculated.numDays).toBe(expected.numDays);
  });

  it('TEST 2: tests a 3 day difference using the day zero calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 6, 'day': 1 };
    expected.endDate = { 'year': 2019, 'month': 6, 'day': 4 };
    expected.numDays = 3;
    regular = false;
    numDays = 0;
    calculated = component.calculateStartDate(regular, suspended, numDays, expected.startDate, expected.endDate, suspendDate, resumeDate);

    expect(calculated.numDays).toBe(expected.numDays);
  });

  it('TEST 3: tests end date for 30 num days given start date using the day zero calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 1 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 31 };
    expected.numDays = 30;

    endDate = null;
    regular = false;

    calculated = component.calculateStartDate(regular, suspended, expected.numDays, expected.startDate, endDate, suspendDate, resumeDate);

    expect(calculated.endDate.year === expected.endDate.year && calculated.endDate.month === expected.endDate.month && calculated.endDate.day === expected.endDate.day).toBeTruthy();
  });

  it('TEST 4: tests end date for 30 num days given start date using the calendar calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 1 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 30 };
    expected.numDays = 30;

    endDate = null;
    regular = true;

    calculated = component.calculateStartDate(regular, suspended, expected.numDays, expected.startDate, endDate, suspendDate, resumeDate);
    expect(calculated.endDate.year === expected.endDate.year && calculated.endDate.month === expected.endDate.month && calculated.endDate.day === expected.endDate.day).toBeTruthy();
  });

  it('TEST 5: tests start date for 4 num days given end date using the day zero calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 13 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 17 };
    expected.numDays = 4;

    startDate = null;
    numDays = 4;
    regular = false;

    calculated = component.calculateStartDate(regular, suspended, expected.numDays, startDate, expected.endDate, suspendDate, resumeDate);

    expect(calculated.startDate.year === expected.startDate.year && calculated.startDate.month === expected.startDate.month && calculated.startDate.day === expected.startDate.day).toBeTruthy();
  });

  it('TEST 6: tests start date for 4 num days given end date using the calendar zero calculation type', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 14 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 17 };
    expected.numDays = 4;

    startDate = null;
    numDays = 4;
    regular = true;

    calculated = component.calculateStartDate(regular, suspended, expected.numDays, startDate, expected.endDate, suspendDate, resumeDate);

    expect(calculated.startDate.year === expected.startDate.year && calculated.startDate.month === expected.startDate.month && calculated.startDate.day === expected.startDate.day).toBeTruthy();
  });

  it('TEST 7: tests end date calculation given suspension period', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 1 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 27 };
    expected.numDays = 20;

    endDate = null;
    suspended = true;
    regular = false;
    suspendDate = { 'year': 2019, 'month': 5, 'day': 12 };
    resumeDate = { 'year': 2019, 'month': 5, 'day': 18 };


    calculated = component.calculateStartDate(regular, suspended, expected.numDays, expected.startDate, endDate, suspendDate, resumeDate);

    expect(calculated.endDate.year === expected.endDate.year && calculated.endDate.month === expected.endDate.month && calculated.endDate.day === expected.endDate.day).toBeTruthy();
  });

  it('TEST 8: tests num day calculation given suspension period', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = { 'year': 2019, 'month': 5, 'day': 9 };
    expected.endDate = { 'year': 2019, 'month': 5, 'day': 27 };
    expected.numDays = 15;

    numDays = null;
    suspended = true;
    suspendDate = { 'year': 2019, 'month': 5, 'day': 20 };
    resumeDate = { 'year': 2019, 'month': 5, 'day': 23 };
    regular = false;


    calculated = component.calculateStartDate(regular, suspended, numDays, expected.startDate, expected.endDate, suspendDate, resumeDate);
    expect(calculated.numDays).toBe(expected.numDays);
  });



});
