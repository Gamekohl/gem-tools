import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapItem} from "./data/maps";

jest.mock('./data/maps', () => {
    const mapData = [
        {name: 'dcg_deulin_chateau'},
        {name: 'urban ruins'},
        {name: 'Forest_Battle'},
    ];

    return {
        mapData,
    };
});

import {MapsComponent} from './maps.component';

describe('MapsComponent', () => {
    let component: MapsComponent;
    let fixture: ComponentFixture<MapsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MapsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize maps from mapData in constructor', () => {
        const comp = new MapsComponent();

        const names = comp.maps().map(m => m.name);
        expect(names).toEqual([
            'dcg_deulin_chateau',
            'urban ruins',
            'Forest_Battle',
        ]);
    });

    it('visibleMaps should sort maps by name (localeCompare) when no query', () => {
        const comp = new MapsComponent();

        const names = comp.visibleMaps().map(m => m.name);

        expect(names).toHaveLength(3);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('visibleMaps should filter case-insensitively by query', () => {
        const comp = new MapsComponent();

        comp.query.set('forest');
        expect(comp.visibleMaps().map(m => m.name)).toEqual(['Forest_Battle']);

        comp.query.set('URBAN');
        expect(comp.visibleMaps().map(m => m.name)).toEqual(['urban ruins']);

        comp.query.set('not-existing');
        expect(comp.visibleMaps()).toEqual([]);
    });

    it('onPreviewError should mark map as missing and previewUrl should return _missing.webp afterwards', () => {
        const comp = new MapsComponent();
        const m: MapItem = {name: 'dcg_deulin_chateau'} as any;

        expect(comp.previewUrl(m)).toBe('/assets/maps/dcg_deulin_chateau.webp');

        comp.onPreviewError(m);

        expect(comp.previewUrl(m)).toBe('/assets/maps/_missing.webp');
    });

    it('onPreviewError should not affect other maps', () => {
        const comp = new MapsComponent();

        const a: MapItem = {name: 'dcg_deulin_chateau'} as any;
        const b: MapItem = {name: 'urban ruins'} as any;

        comp.onPreviewError(a);

        expect(comp.previewUrl(a)).toBe('/assets/maps/_missing.webp');
        expect(comp.previewUrl(b)).toBe('/assets/maps/' + encodeURIComponent('urban ruins') + '.webp');
    });
});

