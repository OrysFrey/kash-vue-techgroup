import { TestBed } from '@angular/core/testing';

import { PayplansService } from './payplans.service';

describe('PayplansService', () => {
  let service: PayplansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayplansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
