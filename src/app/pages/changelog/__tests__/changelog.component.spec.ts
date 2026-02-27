import {createComponent} from "@testing/utils/testbed";

import { ChangelogComponent } from '../changelog.component';

jest.mock('../../../../content/changelog/changelog.data');

describe('ChangelogComponent', () => {
  let component: ChangelogComponent;

  beforeEach(async () => {
    const result = await createComponent(ChangelogComponent, {
      imports: [ChangelogComponent]
    });

    component = result.component;
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
