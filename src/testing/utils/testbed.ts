import {ComponentFixture, TestBed, type TestModuleMetadata} from '@angular/core/testing';

type ConfigureOpts = TestModuleMetadata & {
    detectChanges?: boolean;
};

export async function configureTestingModule(opts: ConfigureOpts) {
    await TestBed.configureTestingModule(opts).compileComponents();
}

export async function createComponent<T>(
    component: new (...args: any[]) => T,
    opts: ConfigureOpts = {}
) {
    await configureTestingModule(opts);
    const fixture = TestBed.createComponent(component as any) as ComponentFixture<T>;
    if (opts.detectChanges !== false) {
        fixture.detectChanges();
    }
    return { fixture, component: fixture.componentInstance as T };
}