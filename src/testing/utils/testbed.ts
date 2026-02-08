import {Component, Type} from "@angular/core";
import {ComponentFixture, MetadataOverride, TestBed, type TestModuleMetadata} from '@angular/core/testing';

type Override = {
    component: Type<any>,
    override: MetadataOverride<Component>,
}

type ConfigureOpts = TestModuleMetadata & {
    detectChanges?: boolean;
    override?: Override
};

export async function configureTestingModule({override, detectChanges, ...rest}: ConfigureOpts) {
    let testBed = TestBed.configureTestingModule(rest);

    if (override) {
        testBed = testBed.overrideComponent(override.component, override.override)
    }

    await testBed
        .compileComponents();
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