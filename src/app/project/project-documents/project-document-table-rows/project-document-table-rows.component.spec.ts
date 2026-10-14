import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DocumentTableRowsComponent } from './project-document-table-rows.component';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

describe('DocumentTableRowsComponent', () => {
  let component: DocumentTableRowsComponent;
  let documentService: jasmine.SpyObj<DocumentService>;
  let toast: jasmine.SpyObj<ToastService>;

  // A table row as ProjectDocumentsComponent.setRowData builds it.
  const row = (eagleId: string | null) => ({ id: 'uuid-1', eagleId, projectEagleId: 'p1', isFeatured: false });

  beforeEach(() => {
    documentService = jasmine.createSpyObj('DocumentService', ['feature', 'unFeature']);
    documentService.feature.and.returnValue(of({} as any));
    toast = jasmine.createSpyObj('ToastService', ['error']);
    TestBed.configureTestingModule({
      imports: [DocumentTableRowsComponent],
      providers: [
        provideRouter([]),
        { provide: DocumentService, useValue: documentService },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    // No detectChanges: the handlers under test need no rendered template.
    component = TestBed.createComponent(DocumentTableRowsComponent).componentInstance;
  });

  it('opens the detail screen by the row DEMI id under the Eagle project id', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    component.goToItem(row('e1'));

    expect(navigate).toHaveBeenCalledOnceWith(['/p', 'p1', 'project-documents', 'detail', 'uuid-1']);
  });

  it('features a row by its Eagle id', () => {
    const item = row('e1');

    component.favoriteDocument(item);

    expect(documentService.feature).toHaveBeenCalledOnceWith('e1');
    expect(item.isFeatured).toBeTrue();
  });

  it('refuses to feature a row DEMI holds alone', () => {
    component.favoriteDocument(row(null));

    expect(documentService.feature).not.toHaveBeenCalled();
    expect(documentService.unFeature).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
