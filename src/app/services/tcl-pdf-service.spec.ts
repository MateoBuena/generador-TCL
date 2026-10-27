import { TestBed } from '@angular/core/testing';
import { TclPdfService } from './tcl-pdf-service';

describe('TclPdfService', () => {
  let service: TclPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TclPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
