import {createComponent} from "@testing/utils/testbed";
import {MapItem} from "../data/maps";

jest.mock('../data/maps');

import {MapsComponent} from '../maps.component';

describe('MapsComponent', () => {
    let component: MapsComponent;

    beforeEach(async () => {
        const result = await createComponent(MapsComponent, {
            imports: [MapsComponent]
        });

        component = result.component;
    });

    it('should initialize maps from mapData in constructor', () => {
        const names = component.maps().map(m => m.name);
        expect(names).toEqual([
            'dcg_deulin_chateau',
            'urban ruins',
            'Forest_Battle',
        ]);
    });

    it('visibleMaps should sort maps by name (localeCompare) when no query', () => {
        const names = component.visibleMaps().map(m => m.name);

        expect(names).toHaveLength(3);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('visibleMaps should filter case-insensitively by query', () => {
        component.query.set('forest');
        expect(component.visibleMaps().map(m => m.name)).toEqual(['Forest_Battle']);

        component.query.set('URBAN');
        expect(component.visibleMaps().map(m => m.name)).toEqual(['urban ruins']);

        component.query.set('not-existing');
        expect(component.visibleMaps()).toEqual([]);
    });

    it('onPreviewError should mark map as missing and previewUrl should return _missing.webp afterwards', () => {
        const m: MapItem = {name: 'dcg_deulin_chateau'} as any;

        expect(component.previewUrl(m)).toBe('/assets/maps/dcg_deulin_chateau.webp');

        component.onPreviewError(m);

        expect(component.previewUrl(m)).toBe('/assets/maps/_missing.webp');
    });

    it('onPreviewError should not affect other maps', () => {
        const a: MapItem = {name: 'dcg_deulin_chateau'} as any;
        const b: MapItem = {name: 'urban ruins'} as any;

        component.onPreviewError(a);

        expect(component.previewUrl(a)).toBe('/assets/maps/_missing.webp');
        expect(component.previewUrl(b)).toBe('/assets/maps/' + encodeURIComponent('urban ruins') + '.webp');
    });
});

