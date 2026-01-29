import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ActivatedRoute} from "@angular/router";
import {ManifestItem} from "../services/tutorial-manifest.service";

import { TutorialCardComponent } from '../tutorial-card/tutorial-card.component';

describe('TutorialCardComponent', () => {
  let component: TutorialCardComponent;
  let fixture: ComponentFixture<TutorialCardComponent>;

  const mockManifestItem: ManifestItem = {
    author: 'Test',
    title: 'Test Item',
    subtitle: 'Test subtitle',
    id: 'test',
    file: 'tutorial.md'
  }

  const mockRoute = {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialCardComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', mockManifestItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
