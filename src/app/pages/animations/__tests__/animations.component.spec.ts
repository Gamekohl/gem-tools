import {Clipboard} from "@angular/cdk/clipboard";
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {PLATFORM_ID} from "@angular/core";
import {TestBed, TestModuleMetadata} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {createComponent} from "@testing/utils/testbed";
import {FilterPipe} from '../../../pipes/filter.pipe';
import {AnimationsComponent} from '../animations.component';

const spyOn = jest.spyOn;

describe('AnimationsComponent', () => {
    let component: AnimationsComponent;
    let clipboard: Clipboard;

    const metadata: TestModuleMetadata = {
        imports: [
            AnimationsComponent,
            FormsModule,
            FilterPipe
        ],
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
        ],
    }

    beforeEach(async () => {
        const result = await createComponent(AnimationsComponent, metadata);

        component = result.component;
        clipboard = TestBed.inject(Clipboard);
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should update the query model', () => {
        component.query.set('fade');
        expect(component.query()).toBe('fade');
    });

    it('should copy animation name to clipboard', async () => {
        const spy = spyOn(clipboard, 'copy');
        const animationName = 'fadeIn';

        component.copyAnimationName(animationName);

        expect(spy).toHaveBeenCalledWith(animationName);
    });

    it('should not copy animation name to clipboard if platform is server', async () => {
        TestBed.resetTestingModule();

        const result = await createComponent(AnimationsComponent, {
            ...metadata,
            providers: [
                ...metadata.providers!,
                {provide: PLATFORM_ID, useValue: 'server'},
            ]
        });

        component = result.component;

        const spy = spyOn(clipboard, 'copy');

        component.copyAnimationName('fadeIn');

        expect(spy).not.toHaveBeenCalled();
    });
});
