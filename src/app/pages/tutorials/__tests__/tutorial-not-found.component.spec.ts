import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from "@angular/router";
import {provideActivatedRouteMock} from "@testing/mocks/activated-route";

import {TutorialNotFoundComponent} from '../tutorial-not-found/tutorial-not-found.component';

describe('TutorialNotFoundComponent', () => {
    let component: TutorialNotFoundComponent;
    let fixture: ComponentFixture<TutorialNotFoundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TutorialNotFoundComponent],
            providers: [
                {provide: ActivatedRoute, useValue: provideActivatedRouteMock()}
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TutorialNotFoundComponent);
        fixture.autoDetectChanges();

        component = fixture.componentInstance;

        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
