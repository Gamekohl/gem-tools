import {MapItem} from "../../app/pages/maps/data/maps";

export function buildMapItem(overrides: Partial<MapItem> = {}): MapItem {
    return {
        name: 'dcg_deulin_chateau',
        ...overrides,
    } as MapItem;
}