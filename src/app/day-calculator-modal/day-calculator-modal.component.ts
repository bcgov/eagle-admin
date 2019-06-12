import { Component, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from 'lodash';
import * as moment from 'moment';
import { Utils } from 'app/shared/utils/utils';

export enum DayCalculatorModalResult {
  Dismissed,
  Finding,
  Exploring
}

export class DayCalculatorResult {
  startDate: any = null;
  endDate: any  = null;
  numDays: number = null;
}

@Component({
  selector: 'app-day-calculator-modal',
  templateUrl: './day-calculator-modal.component.html',
  styleUrls: ['./day-calculator-modal.component.scss']
})
export class DayCalculatorModalComponent implements OnInit {

  startDate = null;
  endDate = null;
  numDays = 0;
  suspendDate = null;
  resumeDate = null;

  startDateAlert = '';
  endDateAlert = '';
  suspendDateAlert = '';
  resumeDateAlert = '';
  errorAlert = '';

  showRules = false;

  types: Array<Dictionary<string>> = [
    { displayName: 'Day Zero', value: 'dayZero' },
    { displayName: 'Calendar', value: 'regular' },
    { displayName: 'Suspension', value: 'suspended' }
  ];
  type = this.types[0];

  constructor(
    public activeModal: NgbActiveModal, // also used in template
    private utils: Utils
  ) { }

  ngOnInit() {
  }

  public dismiss() {
    this.activeModal.close(DayCalculatorModalResult.Dismissed);
  }

  isNonBCBusinessDay(date) {
    // No date is acceptible
    if (!date) { return ''; }

    // Valid date?
    date = moment(date);
    if (!date.isValid()) { return 'Invalid date'; }

    // Weekend?
    let day = date.day();
    if (day === 0) { return 'Sunday'; }
    if (day === 6) { return 'Saturday'; }

    // Holiday?
    let month = date.month() + 1;
    let monthDay = date.date();
    let isMonday = day === 1;

    // New Year's Day
    if (month === 1 && monthDay === 1) { return 'New Year\'s Day'; }

    // Family Day: Second Monday of February
    if (month === 2 && isMonday && monthDay > 7 && monthDay < 15) { return 'Family Day'; }

    // Good Friday: Hard-coded.
    let year = date.year();
    if ((year === 2017 && month === 4 && monthDay === 14) ||
      (year === 2018 && month === 3 && monthDay === 30) ||
      (year === 2019 && month === 4 && monthDay === 19) ||
      (year === 2020 && month === 4 && monthDay === 10) ||
      (year === 2021 && month === 4 && monthDay === 2) ||
      (year === 2022 && month === 4 && monthDay === 15) ||
      (year === 2023 && month === 4 && monthDay === 7) ||
      (year === 2024 && month === 3 && monthDay === 29) ||
      (year === 2025 && month === 4 && monthDay === 18) ||
      (year === 2026 && month === 4 && monthDay === 3) ||
      (year === 2027 && month === 3 && monthDay === 26)) { return 'Good Friday'; }

    // Easter Monday: Hard-coded.
    if ((year === 2017 && month === 4 && monthDay === 17) ||
      (year === 2018 && month === 4 && monthDay === 2) ||
      (year === 2019 && month === 4 && monthDay === 22) ||
      (year === 2020 && month === 4 && monthDay === 13) ||
      (year === 2021 && month === 4 && monthDay === 5) ||
      (year === 2022 && month === 4 && monthDay === 18) ||
      (year === 2023 && month === 4 && monthDay === 10) ||
      (year === 2024 && month === 4 && monthDay === 1) ||
      (year === 2025 && month === 4 && monthDay === 21) ||
      (year === 2026 && month === 4 && monthDay === 6) ||
      (year === 2027 && month === 3 && monthDay === 29)) { return 'Easter Monday'; }

    // Victoria Day: Penultimate Monday of May
    if (month === 5 && isMonday && monthDay > 17 && monthDay < 25) { return 'Victoria Day'; }

    // Canada Day: will fall on the 2nd if the 1st is a Sunday
    if ((month === 7 && monthDay === 1) || (month === 7 && monthDay === 2 && isMonday)) { return 'Canada Day'; }

    // B.C. Day: First Monday of August
    if (month === 8 && isMonday && monthDay < 8) { return 'B.C. Day'; }

    // Labour Day: First Monday of September
    if (month === 9 && isMonday && monthDay < 8) { return 'Labour Day'; }

    // Thanksgiving Day: Second Monday of October
    if (month === 10 && isMonday && monthDay > 7 && monthDay < 15) { return 'Thanksgiving Day'; }

    // Remembrance Day
    if (month === 11 && monthDay === 11) { return 'Remembrance Day'; }

    // Christmas Day
    if (month === 12 && monthDay === 25) { return 'Christmas Day'; }

    // Boxing Day
    if (month === 12 && monthDay === 26) { return 'Boxing Day'; }

    // Otherwise
    return '';
  }

  getDateAlert(date) {
    let alert = this.isNonBCBusinessDay(date);
    if (alert) {
      // TODO: Use alert text for better description.
      return 'Non-BC Business Day';
    }
    return '';
  }

  // Update alert text when a date changes

  updateStartDateAlert() {
    this.startDateAlert = this.getDateAlert(this.startDate);
  }

  updateEndDateAlert() {
    this.endDateAlert = this.getDateAlert(this.endDate);
  }

  updateSuspendDateAlert() {
    this.suspendDateAlert = this.getDateAlert(this.suspendDate);
  }

  updateResumeDateAlert() {
    this.resumeDateAlert = this.getDateAlert(this.resumeDate);
  }

  // this.ok = function() { $uibModalInstance.dismiss('cancel'); };

  reset() {
    this.startDate = null;
    this.endDate = null;
    this.numDays = 0;
    this.suspendDate = null;
    this.resumeDate = null;

    this.startDateAlert = '';
    this.endDateAlert = '';
    this.suspendDateAlert = '';
    this.resumeDateAlert = '';
    this.errorAlert = '';

    this.showRules = false;

    this.type = this.types[0];
  }

  calculateStartDate(
    regular: boolean,
    suspended: boolean,
    numDays: number,
    startDate,
    endDate,
    suspendDate,
    resumeDate
    ) {
      let calcRes = new DayCalculatorResult();

      calcRes.startDate = startDate;
      calcRes.endDate = endDate;
      calcRes.numDays = numDays;

       // convert NGB Date to Javascript Date

      if (startDate) {
        startDate = this.utils.convertFormGroupNGBDateToJSDate(startDate);
      }
      if (endDate) {
        endDate = this.utils.convertFormGroupNGBDateToJSDate(endDate);
      }
      if (suspendDate) {
        suspendDate = this.utils.convertFormGroupNGBDateToJSDate(suspendDate);
      }
      if (resumeDate) {
        resumeDate = this.utils.convertFormGroupNGBDateToJSDate(resumeDate);
      }

      let startDateMoment = moment(startDate);
      let endDateMoment = moment(endDate);
      let suspendDateMoment = moment(suspendDate);
      let resumeDateMoment = moment(resumeDate);

      if (suspended && suspendDate && resumeDate && suspendDateMoment >= resumeDateMoment) {
        // Show error if resume date is later than suspend date
        throw new Error('The suspension date must come before the resumption date.');
      }

      if (suspended && suspendDate && !resumeDate) {
        // show error if resume date not filled while suspend date is
        throw new Error('A resumption date is required.');
      }

      if (suspended && !suspendDate && resumeDate) {
        // show error if suspend date is not filled while resume date is
        throw new Error('A suspension date is required.');
      }

      // Given two of Start Date, End Date, and Number of Days, calculate the third field.

      if (startDate && endDate) {

        if (startDateMoment >= endDateMoment) {
          // Show error if start date is later than end date
          throw new Error('The start date must come before the end date.');
        }

        // Include the start date in the calculation.
        calcRes.numDays = regular ? 1 : 0;

        // Count the number of days between start and end dates
        let date = startDateMoment;

        // Look at every date between
        while (date < endDateMoment) {
          date.add(1, 'd');

          // Factor in a suspension
          if (suspended && suspendDate && date >= suspendDateMoment) {
            // Stop if the suspension goes past the end date
            if (!resumeDate || endDateMoment < resumeDateMoment) {
              return calcRes;
            }

            // Don't count days in the suspension range
            if (date < resumeDateMoment) { continue; }
          }

          // If we've made it this far, count the day
          calcRes.numDays++;
        }
      } else if (startDate && calcRes.numDays) {
        // Find the end date from the start date and number of days
        endDateMoment = moment(startDate);

        // Include the start date in the calculation.
        numDays = regular ? 1 : 0;

        // Start counting the days
        while (numDays < calcRes.numDays) {
          endDateMoment.add(1, 'days');

          // Factor in a suspension
          if (suspended && suspendDate && endDateMoment >= suspendDateMoment) {
            if (!resumeDate) {
              // Can't find an end date if there is no resume date
              calcRes.endDate = null;
              return calcRes;
            }

            // Don't count days in the suspension range
            if (endDateMoment < resumeDateMoment) { continue; }
          }

          // If we've made it this far, count the day
          numDays++;
        }
        // convert moment date back to Date() object so it displays in datepicker

        let JS_endDate = new Date (endDateMoment.year(), endDateMoment.month(), endDateMoment.date());
        calcRes.endDate = this.utils.convertJSDateToNGBDate(JS_endDate);

      } else if (endDate && calcRes.numDays) {
        // Find the start date from the end date and number of days

        startDateMoment = moment(endDate);

        // Include the start date in the calculation.
        numDays = regular ? 1 : 0;

        // Start counting back the days
        while (numDays < calcRes.numDays) {
          startDateMoment.subtract(1, 'd');

          // Factor in a suspension
          if (suspended && suspendDate && startDateMoment >= suspendDateMoment) {
            if (!resumeDate) {
              // Can't find a start date if there is no resume date
              calcRes.startDate = null;
              return calcRes;
            }

            // Don't count days in the suspension range
            if (startDateMoment < resumeDateMoment) { continue; }
          }

          // If we've made it this far, count the day
          numDays++;
        }

        // convert moment date back to Date() object so it displays in datepicker
        let JS_startDate = new Date (startDateMoment.year(), startDateMoment.month(), startDateMoment.date());
        calcRes.startDate = this.utils.convertJSDateToNGBDate(JS_startDate);
      }
      return calcRes;
  }

  go() {
    let calcRes = new DayCalculatorResult();
    try {
      calcRes = this.calculateStartDate(
      this.type.value === 'regular',
      this.type.value === 'suspended',
      this.numDays,
      this.startDate,
      // console.log("go: print start date in try block")
      // console.log(this.startDate)

      this.endDate,
      this.suspendDate,
      this.resumeDate);
    } catch (e) {
      this.errorAlert = e.message;
      return;
    }
    this.startDate = calcRes.startDate;
    this.endDate = calcRes.endDate;
    this.numDays = calcRes.numDays;
  }

  // Handle escape key press.
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.dismiss();
  }
}
