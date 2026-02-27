import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {MockTutorialManifest} from "@testing/mocks/tutorial-manifest";
import { createComponent } from '@testing/utils/testbed';

import { TutorialCardComponent } from '../tutorial-card/tutorial-card.component';

describe('TutorialCardComponent', () => {
  let component: TutorialCardComponent;
  let fixture: ComponentFixture<TutorialCardComponent>;

  beforeEach(async () => {
    const result = await createComponent(TutorialCardComponent, {
      imports: [TutorialCardComponent],
      providers: [provideRouter([])],
      detectChanges: false,
    });

    fixture = result.fixture;
    component = result.component;
    fixture.componentRef.setInput('item', new MockTutorialManifest().getItem(0));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
