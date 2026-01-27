import {Clipboard} from "@angular/cdk/clipboard";
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import { MatTreeModule } from '@angular/material/tree';
import {testStructureData} from "../../../testing/data/structure";
import { ResourcesComponent } from './resources.component';
const spyOn = jest.spyOn;

const mockData = testStructureData;

// We mock the data here to prevent loading the whole JSON file
jest.mock('./data/structure', () => {
  const structureData = testStructureData;

  return { structureData }
});

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesComponent, ReactiveFormsModule, MatTreeModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter the tree based on the query', () => {
    // component['_data'] = mockData;

    component.applyFilter('Node1');
    expect(component.dataSource).toEqual([mockData[0]]);

    component.applyFilter('');
    expect(component.dataSource).toEqual(mockData);
  });

  it('should highlight text in getText when query matches', () => {
    component['currentQuery'] = 'Node';
    const result = component.getText('Node1');
    expect(result).toContain('<mark>Node</mark>1');

    component['currentQuery'] = '';
    const noHighlight = component.getText('Node1');
    expect(noHighlight).toBe('Node1');
  });

  it('should debounce search input and apply filter', (done) => {
    const searchControl = component.form.get('search');
    spyOn(component, 'applyFilter');

    searchControl?.setValue('Node');
    setTimeout(() => {
      expect(component.applyFilter).toHaveBeenCalledWith('Node');
      done();
    }, 600); // Wait for debounceTime (500ms) + buffer
  });

  it('should apply filter when search is empty', (done) => {
    const searchControl = component.form.get('search');
    searchControl?.patchValue('test');
    spyOn(component, 'applyFilter');

    searchControl?.setValue('');
    setTimeout(() => {
      expect(component.applyFilter).toHaveBeenCalledWith('');
      done();
    }, 600);
  });

  it('should copy name to clipboard', () => {
    const clipboard = TestBed.inject(Clipboard);
    const snackbar = TestBed.inject(MatSnackBar);

    const clipboardSpy = spyOn(clipboard, 'copy');
    const snackbarSpy = spyOn(snackbar, 'open');

    component.copyName('Node1');
    expect(clipboardSpy).toHaveBeenCalledWith('Node1');
    expect(snackbarSpy).toHaveBeenCalledWith('"Node1" copied to clipboard', '', { duration: 2000 });
  });
});
