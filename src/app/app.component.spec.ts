import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import * as vercelAnalytics from '@vercel/analytics';
import { AppComponent } from './app.component';

jest.mock('@vercel/analytics', () => ({
  inject: jest.fn()
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NgIconComponent
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call inject() from vercel analytics on initialization', () => {
    component.ngOnInit();
    
    expect(vercelAnalytics.inject).toHaveBeenCalled();
    expect(vercelAnalytics.inject).toHaveBeenCalledTimes(1);
  });

  it('should render without errors', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });
});
