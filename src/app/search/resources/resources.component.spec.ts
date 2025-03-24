import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { ResourcesComponent } from './resources.component';
const spyOn = jest.spyOn;

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with data from the HTTP request', () => {
    const mockData = [
      { name: 'Node1', children: [{ name: 'Child1', children: [] }] },
      { name: 'Node2', children: [] },
    ];

    const req = httpMock.expectOne('/assets/structure.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(component.dataSource).toEqual(mockData);
    expect(component['_data']).toEqual(mockData);
  });

  it('should filter the tree based on the query', () => {
    component['_data'] = [
      { name: 'Node1', children: [{ name: 'Child1', children: [] }] },
      { name: 'Node2', children: [] },
    ];

    component.applyFilter('Node1');
    expect(component.dataSource).toEqual([
      { name: 'Node1', children: [{ name: 'Child1', children: [] }] },
    ]);

    component.applyFilter('');
    expect(component.dataSource).toEqual(component['_data']);
  });

  it('should find the correct path for a node', () => {
    const mockData = [
      { name: 'Node1', children: [{ name: 'Child1', children: [] }] },
      { name: 'Node2', children: [] },
    ];

    const path = component['findPath']('Child1', mockData);
    expect(path).toEqual(['Node1', 'Child1']);

    const noPath = component['findPath']('NonExistent', mockData);
    expect(noPath).toBeNull();
  });

  it('should update the current path when updatePath is called', () => {
    component.dataSource = [
      { name: 'Node1', children: [{ name: 'Child1', children: [] }] },
      { name: 'Node2', children: [] },
    ];

    component['updatePath']('Child1');
    expect(component.currentPath).toEqual(['Node1', 'Child1']);
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
});
