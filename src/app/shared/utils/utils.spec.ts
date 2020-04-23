import { Utils } from './utils';
import 'zone.js';
import 'zone.js/dist/async-test.js';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import { async } from '@angular/core/testing';

describe('Utils', () => {
  let utilsComponent: Utils;
  let filenameWithSpaces = 'Ajax Mine - Information Bulletin.pdf';
  let filenameWithSlashes = 'Ajax Lead/Silver/Zinc Mine';
  let filenameWithParens = 'Ajax (Mine)';
  let filennameWithMixed = 'Ajax (Mine) Lead/Silver {Tag}';
  beforeEach(async(() => {}));

  beforeEach(() => {
    utilsComponent = new Utils();
  });

  it('TEST1: spaces in document links', () => {
    let encodedFilename = utilsComponent.encodeString(filenameWithSpaces, true);
    let expectedFilename = 'Ajax%20Mine%20-%20Information%20Bulletin.pdf';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST2: slashes in document links', () => {
    let encodedFilename = utilsComponent.encodeString(filenameWithSlashes, true);
    let expectedFilename = 'Ajax%20Lead_Silver_Zinc%20Mine';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST3: parens in document links', () => {
    let encodedFilename = utilsComponent.encodeString(filenameWithParens, true);
    let expectedFilename = 'Ajax%20%28Mine%29';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST4: multiple replacements in document links', () => {
    let encodedFilename = utilsComponent.encodeString(filennameWithMixed, true);
    let expectedFilename = 'Ajax%20%28Mine%29%20Lead_Silver%20%7BTag%7D';
    expect(encodedFilename).toBe(expectedFilename);
  });
});
