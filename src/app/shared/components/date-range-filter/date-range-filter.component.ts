import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '../../utils/constants';
import { filterCompareWith, isNgbDate } from '../../utils/utils';

/**
 * State of a start/end date pair on a list's filter object. The list owns it,
 * so its filter badges and Clear Filters can read and clear the range.
 */
export class DateRange {
  /** ng-select model: one blank item while a date is set, none otherwise. */
  model: object[] = [];
  readonly items: object[] = [{}];

  constructor(
    private readonly filter: () => object,
    readonly startKey: string,
    readonly endKey: string,
    private readonly empty: () => unknown = () => null
  ) {}

  get start() { return this.filter()[this.startKey]; }
  get end() { return this.filter()[this.endKey]; }

  isSet() {
    return isNgbDate(this.start) || isNgbDate(this.end);
  }

  // A cleared date with no other date set empties the range.
  changeDate(event: NgbDateStruct | null, which: 'start' | 'end') {
    const [name, other] = which === 'start' ? [this.startKey, this.endKey] : [this.endKey, this.startKey];
    const filter = this.filter();
    filter[name] = event;
    if (event === null && !isNgbDate(filter[other])) {
      this.clear();
    }
  }

  // A new array each time, so ng-select drops the blank item a click selects while no date is set.
  changeRange() {
    this.model = this.isSet() ? [{}] : [];
  }

  clear() {
    const filter = this.filter();
    filter[this.startKey] = this.empty();
    filter[this.endKey] = this.empty();
    this.model = [];
  }
}

// Default change detection: the list changes the range in place, from its badges and Clear Filters.
@Component({
  selector: 'app-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.css',
  imports: [FormsModule, NgSelectModule, NgbDatepickerModule]
})
export class DateRangeFilterComponent {
  @Input({ required: true }) range!: DateRange;
  @Input({ required: true }) label!: string;

  readonly constants = Constants;
  readonly filterCompareWith = filterCompareWith;
}
