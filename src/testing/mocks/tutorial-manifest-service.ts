import { BehaviorSubject } from 'rxjs';
import {TutorialManifest, TutorialManifestService} from '../../app/pages/tutorials/services/tutorial-manifest.service';

export function createTutorialManifestServiceMock(): Pick<TutorialManifestService, 'manifest$' | 'getMarkdown$'> {
  return {
    manifest$: new BehaviorSubject<TutorialManifest | null>(null),
    getMarkdown$: jest.fn(),
  };
}
