import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DateRange, DateRangeFilterComponent } from './date-range-filter.component';

describe('DateRangeFilterComponent', () => {
  function openPicker(): HTMLElement {
    const fixture = TestBed.createComponent(DateRangeFilterComponent);
    const filter = { decisionDateStart: {}, decisionDateEnd: {} };
    fixture.componentRef.setInput('range', new DateRange(() => filter, 'decisionDateStart', 'decisionDateEnd'));
    fixture.componentRef.setInput('label', 'EA Decision Date');
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance.open();
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('names both date inputs after the filter label', () => {
    const inputs = Array.from(openPicker().querySelectorAll('input.form-control')).map(el => el.getAttribute('aria-label'));

    expect(inputs).toEqual(['EA Decision Date from, yyyy-mm-dd', 'EA Decision Date to, yyyy-mm-dd']);
  });

  it('names both calendar buttons after the date they pick', () => {
    const buttons = Array.from(openPicker().querySelectorAll('button.calendar')).map(el => el.getAttribute('aria-label'));

    expect(buttons).toEqual(['Choose EA Decision Date from date', 'Choose EA Decision Date to date']);
  });
});
