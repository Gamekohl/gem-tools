import {Component, PLATFORM_ID} from "@angular/core";
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from "@angular/router/testing";
import {NgIconComponent} from '@ng-icons/core';
import {createComponent} from "@testing/utils/testbed";
import * as vercelAnalytics from '@vercel/analytics';
import {AppComponent} from './app.component';

const spyOn = jest.spyOn;

@Component({
    selector: 'app-test',
    template: '<div></div>'
})
class TestComponent {
}

jest.mock('@vercel/analytics', () => ({
    inject: jest.fn()
}));

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async () => {
        const result = await createComponent(AppComponent, {
            imports: [
                AppComponent,
                NgIconComponent
            ],
            providers: [
                provideRouter([
                    {component: TestComponent, path: 'test'}
                ])
            ]
        });

        fixture = result.fixture;
        component = result.component;
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

    it('should set opened=false on NavigationStart', async () => {
        component.opened = true;

        component.ngOnInit();

        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/test', TestComponent);

        expect(component.opened).toBe(false);
    });

    it('should return if platform is not browser', async () => {
        TestBed.resetTestingModule();

        const localStorageSpy = spyOn(Storage.prototype, 'getItem');

        const result = await createComponent(AppComponent, {
            imports: [
                AppComponent,
                NgIconComponent
            ],
            providers: [
                provideRouter([]),
                {provide: PLATFORM_ID, useValue: 'server'},
            ]
        });

        const fixture = result.fixture;
        fixture.detectChanges();

        expect(localStorageSpy).not.toHaveBeenCalled();
    });

    it('should set theme to dark and add class to documentElement', () => {
        const documentSpy = spyOn(document.documentElement.classList, 'add');

        component.toggleTheme();

        expect(component.theme()).toBe('dark');
        expect(documentSpy).toHaveBeenCalledWith('dark');
    });

    it('should set theme light and remove class to documentElement', () => {
        component.theme.set('dark');

        const documentSpy = spyOn(document.documentElement.classList, 'remove');

        component.toggleTheme();

        expect(component.theme()).toBe('light');
        expect(documentSpy).toHaveBeenCalled();
    });
});
