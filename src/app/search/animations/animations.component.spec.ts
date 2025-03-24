import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FilterPipe } from '../../pipes/filter.pipe';
import { AnimationsComponent } from './animations.component';
const spyOn = jest.spyOn;

describe('AnimationsComponent', () => {
  let component: AnimationsComponent;
  let fixture: ComponentFixture<AnimationsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnimationsComponent,
        FormsModule,
        FilterPipe
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimationsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch animation names on initialization', () => {
    const mockResponse = { names: ['fadeIn', 'fadeOut', 'slideIn'] };

    const req = httpMock.expectOne('assets/animation_names.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    component.animationNames$.subscribe((names) => {
      expect(names).toEqual(mockResponse.names);
    });
  });

  it('should update the query model', () => {
    component.query.set('fade');
    expect(component.query()).toBe('fade');
  });

  it('should copy animation name to clipboard', async () => {
    const spy = spyOn(navigator.clipboard, 'writeText');
    const animationName = 'fadeIn';

    component.copyAnimationName(animationName);
    expect(spy).toHaveBeenCalledWith(animationName);
  });
});
