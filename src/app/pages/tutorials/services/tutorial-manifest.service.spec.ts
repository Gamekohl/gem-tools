import { TestBed } from '@angular/core/testing';

import { TutorialManifestService } from './tutorial-manifest.service';

describe('TutorialManifestService', () => {
  let service: TutorialManifestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialManifestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
