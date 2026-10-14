import { TestBed } from '@angular/core/testing';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';
import { TableTemplateUtils, nativeSort, nextSortBy, tableSort } from './table-template-utils';

describe('TableTemplateUtils.updateUrl', () => {
  let replaceState: jasmine.Spy;

  function writtenUrl(): string {
    return replaceState.calls.mostRecent().args[2];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/search;keywords=old' } },
        { provide: PlatformLocation, useValue: { getBaseHrefFromDOM: () => '/admin/' } }
      ]
    });
    replaceState = spyOn(window.history, 'replaceState');
  });

  it('escapes keywords, sort and filter values but keeps the commas between filter values', () => {
    TestBed.inject(TableTemplateUtils).updateUrl(
      '+name', 2, 25, { type: 'Energy-Petroleum & Natural Gas,Mines', region: 'a;b' }, '50% off?'
    );

    expect(writtenUrl()).toMatch(
      /^\/admin\/search;currentPage=2;pageSize=25;keywords=50%25%20off%3F;sortBy=%2Bname;type=Energy-Petroleum%20%26%20Natural%20Gas,Mines;region=a%3Bb;ms=\d+$/
    );
  });

  it('leaves out empty keywords and sort', () => {
    TestBed.inject(TableTemplateUtils).updateUrl(null, 1, 10, null, null);

    expect(writtenUrl()).toMatch(/^\/admin\/search;currentPage=1;pageSize=10;ms=\d+$/);
  });
});

describe('nextSortBy', () => {
  it('flips an ascending sort on the same column to descending', () => {
    expect(nextSortBy('+name', 'name')).toBe('-name');
  });

  it('flips a descending sort on the same column back to ascending', () => {
    expect(nextSortBy('-name', 'name')).toBe('+name');
  });

  it('starts a new column ascending when the old column was ascending', () => {
    expect(nextSortBy('+name', 'dateAdded')).toBe('+dateAdded');
  });

  it('starts a new column ascending when the old column was descending', () => {
    expect(nextSortBy('-name', 'dateAdded')).toBe('+dateAdded');
  });

  it('starts ascending when there is no current sort', () => {
    expect(nextSortBy(null, 'name')).toBe('+name');
  });

  it('starts ascending when the current sort is empty', () => {
    expect(nextSortBy('', 'name')).toBe('+name');
  });
});

describe('nativeSort', () => {
  it('keeps a descending sort on the allowed field', () => {
    expect(nativeSort('-displayName', 'displayName')).toBe('-displayName');
  });

  it('sends an ascending table sort without the plus sign', () => {
    expect(nativeSort('+displayName', 'displayName')).toBe('displayName');
  });

  it('falls back to the allowed field for an old multi-column sort', () => {
    expect(nativeSort('-lastName,+firstName', 'displayName')).toBe('displayName');
  });

  it('falls back to the allowed field when there is no sort', () => {
    expect(nativeSort(undefined, 'name')).toBe('name');
  });
});

describe('tableSort', () => {
  it('adds the plus sign the table header expects', () => {
    expect(tableSort('displayName')).toBe('+displayName');
  });

  it('keeps a descending sort as is', () => {
    expect(tableSort('-name')).toBe('-name');
  });
});
