import { TestBed } from '@angular/core/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ListConverterPipe } from './list-converter.pipe';

describe('ListConverterPipe', () => {
  let pipe: ListConverterPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useValue: { lists: [{ id: '5cf00c03a266b7e1877504f5', name: 'Comment Period' }] } }]
    });
    pipe = TestBed.runInInjectionContext(() => new ListConverterPipe());
  });

  it('shows the name of the List row whose id matches', () => {
    expect(pipe.transform('5cf00c03a266b7e1877504f5')).toBe('Comment Period');
  });

  it('shows a dash for an id no List row has', () => {
    expect(pipe.transform('5cf00c03a266b7e1877504f6')).toBe('-');
  });
});
