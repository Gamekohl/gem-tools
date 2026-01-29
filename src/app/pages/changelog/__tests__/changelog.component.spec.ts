import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogComponent } from '../changelog.component';

jest.mock('../../../../content/changelog/changelog.data', () => {
  const CHANGELOG = [
    {
      version: '1.0.0',
      date: '2026-01-01',
      title: 'Test Changelog',
      markdown: '- Test Bullet Point\n',
    },
    {
      version: '1.0.1',
      date: '2026-01-02',
      title: 'Test Changelog 1',
      markdown: '- Test Bullet Point 1\n',
    },
  ];

  return {
    CHANGELOG
  };
});

describe('ChangelogComponent', () => {
  let component: ChangelogComponent;
  let fixture: ComponentFixture<ChangelogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangelogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize selectedEntry with the first changelog entry', () => {
    const selected = component.selectedEntry();
    expect(selected.version).toBe('1.0.0');
    expect(selected.title).toBe('Test Changelog');
  });

  it('should update selectedEntry when selectEntry is called', () => {
    const second = component.changelog[1];
    component.selectEntry(second);

    expect(component.selectedEntry()).toBe(second);
    expect(component.selectedEntry().version).toBe('1.0.1');
  });
});
