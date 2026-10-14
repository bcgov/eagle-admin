import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, RouterStateSnapshot, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { documentResolver } from './document.resolver';
import { DemiDocument } from '../models/demi/document';
import { DocumentService } from '../services/document.service';

describe('documentResolver', () => {
  let documentService: jasmine.SpyObj<DocumentService>;

  function resolve(docId: string) {
    const route = { paramMap: convertToParamMap({ docId }) } as ActivatedRouteSnapshot;
    return firstValueFrom(TestBed.runInInjectionContext(
      () => documentResolver(route, {} as RouterStateSnapshot) as Observable<DemiDocument | RedirectCommand>
    ));
  }

  beforeEach(() => {
    documentService = jasmine.createSpyObj('DocumentService', ['getNative']);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: DocumentService, useValue: documentService }]
    });
  });

  it('returns the native row the detail screen takes', async () => {
    const row = { id: 'uuid-1', eagleId: 'e1', projectId: '7', displayName: 'Appendix D', isPublished: true } as DemiDocument;
    documentService.getNative.and.returnValue(of(row));

    expect(await resolve('e1')).toBe(row);
    expect(documentService.getNative).toHaveBeenCalledOnceWith('e1');
  });

  it('redirects to search when the document cannot be read', async () => {
    documentService.getNative.and.returnValue(of(null));

    expect(await resolve('missing')).toEqual(jasmine.any(RedirectCommand));
  });
});
