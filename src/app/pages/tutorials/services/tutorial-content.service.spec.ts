import { TestBed } from '@angular/core/testing';

import { TutorialContentService } from './tutorial-content.service';

describe('TutorialContentService', () => {
  let service: TutorialContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});