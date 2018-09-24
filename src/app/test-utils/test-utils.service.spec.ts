import { TestBed, inject } from '@angular/core/testing';

import { TestUtilsService } from './test-utils.service';

describe('TestUtilsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestUtilsService]
    });
  });

  it('should be created', inject([TestUtilsService], (service: TestUtilsService) => {
    expect(service).toBeTruthy();
  }));
});
