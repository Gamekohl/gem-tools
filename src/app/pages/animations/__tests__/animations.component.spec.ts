import { Clipboard } from '@angular/cdk/clipboard';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { createComponent } from '@testing/utils/testbed';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { AnimationsComponent } from '../animations.component';

describe('AnimationsComponent', () => {
  let component: AnimationsComponent;

  beforeEach(async () => {
    const result = await createComponent(AnimationsComponent, {
      imports: [AnimationsComponent, FormsModule, FilterPipe],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    component = result.component;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update the query model', () => {
    component.query.set('fade');
    expect(component.query()).toBe('fade');
  });

  it('should copy animation name to clipboard', () => {
    const clipboard = TestBed.inject(Clipboard);
    const spy = jest.spyOn(clipboard, 'copy');
    const animationName = 'fadeIn';

    component.copyAnimationName(animationName);

    expect(spy).toHaveBeenCalledWith(animationName);
  });
});
