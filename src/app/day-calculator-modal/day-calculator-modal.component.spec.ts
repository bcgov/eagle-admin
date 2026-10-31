import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TestBed } from '@angular/core/testing';
import { DayCalculatorModalComponent } from './day-calculator-modal.component';

describe('DayCalculatorModalComponent', () => {
  let component: DayCalculatorModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DayCalculatorModalComponent],
      providers: [{ provide: NgbActiveModal, useValue: {} }]
    });
    component = TestBed.createComponent(DayCalculatorModalComponent).componentInstance;
  });

  // Argument order: regular, suspended, numDays, startDate, endDate, suspendDate, resumeDate.
  it('counts both ends of the range on the calendar type', () => {
    const result = component.calculateStartDate(true, false, 0,
      { year: 2019, month: 6, day: 1 }, { year: 2019, month: 6, day: 10 }, null, null);

    expect(result.numDays).toBe(10);
  });

  it('counts from day zero on the day zero type', () => {
    const result = component.calculateStartDate(false, false, 0,
      { year: 2019, month: 6, day: 1 }, { year: 2019, month: 6, day: 4 }, null, null);

    expect(result.numDays).toBe(3);
  });

  it('puts the end date the number of days after the start on the day zero type', () => {
    const result = component.calculateStartDate(false, false, 30, { year: 2019, month: 5, day: 1 }, null, null, null);

    expect(result.endDate).toEqual({ year: 2019, month: 5, day: 31 });
  });

  it('puts the end date one day earlier on the calendar type, as the start day counts', () => {
    const result = component.calculateStartDate(true, false, 30, { year: 2019, month: 5, day: 1 }, null, null, null);

    expect(result.endDate).toEqual({ year: 2019, month: 5, day: 30 });
  });

  it('puts the start date the number of days before the end on the day zero type', () => {
    const result = component.calculateStartDate(false, false, 4, null, { year: 2019, month: 5, day: 17 }, null, null);

    expect(result.startDate).toEqual({ year: 2019, month: 5, day: 13 });
  });

  it('puts the start date one day later on the calendar type, as the end day counts', () => {
    const result = component.calculateStartDate(true, false, 4, null, { year: 2019, month: 5, day: 17 }, null, null);

    expect(result.startDate).toEqual({ year: 2019, month: 5, day: 14 });
  });

  it('pushes the end date out by the days the period was suspended', () => {
    const result = component.calculateStartDate(false, true, 20, { year: 2019, month: 5, day: 1 }, null,
      { year: 2019, month: 5, day: 12 }, { year: 2019, month: 5, day: 18 });

    expect(result.endDate).toEqual({ year: 2019, month: 5, day: 27 });
  });

  it('leaves the suspended days out of the day count', () => {
    const result = component.calculateStartDate(false, true, null,
      { year: 2019, month: 5, day: 9 }, { year: 2019, month: 5, day: 27 },
      { year: 2019, month: 5, day: 20 }, { year: 2019, month: 5, day: 23 });

    expect(result.numDays).toBe(15);
  });
});
