import { Utils } from './utils';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('sdfasdfas', () => {
  const myInstance = new Utils();
  const inputJSDate = new Date(2010, 6, 14);
  const inputJSDate2 = new Date(2019, 11, 31);
  const inputJSDate3 = new Date(2020, 0, 1);
  const inputJSDate4 = new Date(2016, 6, 27, 13, 30, 0);
  const NGBdate: NgbDateStruct = { year: 2010, month: 7, day: 14 };
  const NGBdate2: NgbDateStruct = { year: 2019, month: 12, day: 31 };
  const NGBdate3: NgbDateStruct = { year: 2020, month: 1, day: 1 };
  const NGBdate4: NgbDateStruct = { year: 2016, month: 7, day: 27 };
  const calculated1 = myInstance.convertJSDateToNGBDate(inputJSDate);
  const calculated2 = myInstance.convertFormGroupNGBDateToJSDate(NGBdate);
  const calculated3 = myInstance.convertFormGroupNGBDateToJSDate(NGBdate2);
  const calculated4 = myInstance.convertJSDateToNGBDate(inputJSDate2);
  const calculated5 = myInstance.convertJSDateToNGBDate(inputJSDate3);
  const calculated6 = myInstance.convertFormGroupNGBDateToJSDate(NGBdate3);
  const calculated7 = myInstance.convertJSDateToNGBDate(inputJSDate4);
  console.log('calculated  NGBdate is :', calculated7 );
  console.log('Expected JSdate is : ', inputJSDate4);

  it('Test 1: should create a NGB date 2010 july 14', () => {
    // console.debug('calculated NGBDate is:' , calculated1);
    // console.debug('Expected NGBdate is: ', NGBdate);
    expect(calculated1).toEqual(NGBdate);
  });
  it('Test 2: should create a js date 2010 july 14', () => {
    expect(calculated2).toEqual(inputJSDate);

  });
  it('Test 3: should create a js date 2019 Dec 31 ', () => {
    // console.debug('calculated js date is:' , calculated3);
    // console.debug('Expected js date is: ', NGBdate2);
    expect(calculated3).toEqual(inputJSDate2);
  });
  it('Test 4: should create a js date 2019 Dec 31 ', () => {
    expect(calculated4).toEqual(NGBdate2);
    });
  it('Test 5: should create a js date 2020 Jan 1 ', () => {
    expect(calculated5).toEqual(NGBdate3);
    });
  it('Test 6: should create a js date 2020 Jan 1 ', () => {
    expect(calculated6).toEqual(inputJSDate3);
    });
  it('Test 7: input js date with time ', () => {
    expect(calculated7).toEqual(NGBdate4);
    });
});
